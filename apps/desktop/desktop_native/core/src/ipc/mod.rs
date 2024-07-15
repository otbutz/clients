pub mod client;
pub mod server;

/// Resolve the path to the IPC socket.
pub fn path(name: &str) -> std::path::PathBuf {
    #[cfg(windows)]
    {
        // Use a unique IPC pipe //./pipe/xxxxxxxxxxxxxxxxx.app.bitwarden per user.
        // Hashing prevents problems with reserved characters and file length limitations.
        use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
        use sha2::Digest;
        let home = dirs::home_dir().unwrap();
        let hash = sha2::Sha256::digest(home.as_os_str().as_encoded_bytes());
        let hash_b64 = URL_SAFE_NO_PAD.encode(hash.as_slice());

        format!(r"\\.\pipe\{hash_b64}.app.{name}").into()
    }

    #[cfg(all(target_os = "macos", not(debug_assertions)))]
    {
        // On MacOS release builds, we use the Application Support directory.
        // This should ensure that the socket is only accessible to the app bundle.
        let config = dirs::config_dir().unwrap();
        config.join("Bitwarden").join(format!("app.{name}"))
    }

    #[cfg(any(target_os = "linux", all(target_os = "macos", debug_assertions)))]
    {
        // On other platforms, we use the user's tmp directory.
        // This is currently the case for Linux and debug MacOS builds.
        let home = dirs::home_dir().unwrap();
        home.join("tmp").join(format!("app.{name}"))
    }
}
