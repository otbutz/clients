use std::sync::Arc;

use anyhow::Error;
#[cfg(windows)]
use async_stream::stream;
#[cfg(windows)]
use futures::stream::{Stream, StreamExt};

use ssh_agent::Key;
use std::collections::HashMap;
use std::sync::RwLock;
use tokio::sync::Mutex;
use tokio_util::sync::CancellationToken;

pub mod msg;
pub mod ssh_agent;
pub mod russh_encoding;
#[cfg(windows)]
pub mod namedpipelistenerstream;

#[cfg(unix)]
use tokio::net::UnixListener;
#[cfg(unix)]
use homedir::my_home;

#[derive(Clone)]
pub struct BitwardenDesktopAgent {
    keystore: ssh_agent::KeyStore,
    cancellation_token: CancellationToken,
    show_ui_request_tx: tokio::sync::mpsc::Sender<String>,
    get_ui_response_rx: Arc<Mutex<tokio::sync::mpsc::Receiver<bool>>>,
}


impl ssh_agent::Agent for BitwardenDesktopAgent {
    async fn confirm(&self, ssh_key: Key) -> bool {
        // make sure we will recv our response by locking the channel
        let mut rx_channel = self.get_ui_response_rx.lock().await;
        self.show_ui_request_tx.send(ssh_key.cipher_uuid).await.unwrap();
        let res = rx_channel.recv().await.unwrap();
        res
    }
}

impl BitwardenDesktopAgent {

    #[cfg(unix)]
    pub async fn start_server(
        auth_request_tx: tokio::sync::mpsc::Sender<String>,
        auth_response_rx: Arc<Mutex<tokio::sync::mpsc::Receiver<bool>>>,
    ) -> Result<Self, anyhow::Error> {
        let agent = BitwardenDesktopAgent {
            keystore: ssh_agent::KeyStore(Arc::new(RwLock::new(HashMap::new()))),
            cancellation_token: CancellationToken::new(),
            show_ui_request_tx: auth_request_tx,
            get_ui_response_rx: auth_response_rx,
        };
        let cloned_agent_state = agent.clone();
        tokio::spawn(async move {
            let env_path = std::env::var("BITWARDEN_SSH_AUTH_SOCK");
            let ssh_path = match env_path {
                Ok(path) => path,
                Err(_) => {
                    println!("[SSH Agent Native Module] BITWARDEN_SSH_AUTH_SOCK not set, using default path");
                    my_home().unwrap().ok_or(Error::msg("Could not determine home directory")).unwrap()
                        .join(".bitwarden-ssh-agent.sock")
                        .to_str()
                        .ok_or(Error::msg("Could not determine home directory")).unwrap()
                        .to_string()
                }
            };
            println!("[SSH Agent Native Module] Starting SSH Agent server on {:?}", ssh_path);
            let sockname = std::path::Path::new(&ssh_path);
            let _ = std::fs::remove_file(sockname);
            match UnixListener::bind(sockname) {
                Ok(listener) => {
                    let wrapper = tokio_stream::wrappers::UnixListenerStream::new(listener);
                    let cloned_keystore = cloned_agent_state.keystore.clone();
                    let cloned_cancellation_token = cloned_agent_state.cancellation_token.clone();
                    let _ = ssh_agent::serve(
                        wrapper,
                        cloned_agent_state,
                        cloned_keystore,
                        cloned_cancellation_token
                    )
                    .await;
                    println!("[SSH Agent Native Module] SSH Agent server exited");
                }
                Err(e) => {
                    eprintln!("[SSH Agent Native Module] Error while starting agent server: {}", e);
                }
            }
        });

        Ok(agent)
    }

    pub fn stop(&self) {
        self.cancellation_token.cancel();
        self.keystore.0.write().unwrap().clear();
    }

    #[cfg(windows)]
    pub async fn start_server(
        auth_request_tx: tokio::sync::mpsc::Sender<String>,
        auth_response_rx: Arc<Mutex<tokio::sync::mpsc::Receiver<bool>>>,
    ) -> Result<Self, anyhow::Error> {
        let agent_state = BitwardenDesktopAgent {
            keystore: ssh_agent::KeyStore(Arc::new(RwLock::new(HashMap::new()))),
            show_ui_request_tx: auth_request_tx,
            get_ui_response_rx: auth_response_rx,
            cancellation_token: CancellationToken::new(),
        };
        let stream = namedpipelistenerstream::NamedPipeServerStream::new(agent_state.cancellation_token.clone());

        let cloned_agent_state = agent_state.clone();
        tokio::spawn(async move {
            let _ = ssh_agent::serve(
                stream,
                cloned_agent_state.clone(),
                cloned_agent_state.keystore.clone(),
                cloned_agent_state.cancellation_token.clone(),
            ).await;
        });
        Ok(agent_state)
    }

    pub fn set_keys(
        &mut self,
        new_keys: Vec<(String, String, String)>) -> Result<(), anyhow::Error> {
        let keystore = &mut self.keystore;
        keystore.0.write().unwrap().clear();

        for (key, name, uuid) in new_keys.iter() {
            match parse_key_safe(&key) {
                Ok(private_key) => {
                    let public_key_bytes = private_key.public_key().to_bytes().unwrap();
                    keystore.0.write().unwrap().insert(
                        public_key_bytes,
                        Key {
                            private_key: Some(private_key),
                            name: name.clone(),
                            cipher_uuid: uuid.clone(),
                        },
                    );
                }
                Err(e) => {
                    eprintln!("[SSH Agent Native Module] Error while parsing key: {}", e);
                }
            }
        }

        Ok(())
    }

    pub fn lock(&mut self) -> Result<(), anyhow::Error> {
        let keystore = &mut self.keystore;
        keystore.0.write().unwrap().iter_mut().for_each(|(_public_key, key)| {
            key.private_key = None;
        });
        Ok(())
    }
}

fn parse_key_safe(pem: &str) -> Result<ssh_key::private::PrivateKey, anyhow::Error> {
    match ssh_key::private::PrivateKey::from_openssh(pem) {
        Ok(key) => {
            match key.public_key().to_bytes() {
                Ok(_) => Ok(key),
                Err(e) => Err(anyhow::Error::msg(format!("Failed to parse public key: {}", e))),
            }
        },
        Err(e) => Err(anyhow::Error::msg(format!("Failed to parse key: {}", e))),
    }
}