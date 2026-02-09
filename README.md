# MoonLight

![banner](https://raw.githubusercontent.com/ParafieldDevelopment/MoonLight/refs/heads/main/banner/img.png)

MoonLight is an advanced, modern IDE for Roblox development, built with Electron and TypeScript. It aims to replace the traditional Roblox script editor with a more powerful, customizable, and user-friendly environment.

*"Ignore the mess, Code with simplicity"* - mas6y6

# THE IDE IS IN VERY EARLY DEVELOPMENT AND IS NOT READY FOR USE YET.

## ✨ Key Features

- **Modern Interface**: A sleek, customizable UI built with modern web technologies.
- **Roblox Studio Integration**: Real-time synchronization with Roblox Studio via a built-in WebSocket server.
- **Cross-Platform**: Designed to work on Windows, macOS, and Linux (with specialized support for Vinegar).
- **Smooth Animations**: Professional-grade transitions and animations for a superior user experience.
- **Safe Workspace**: Structured project selection and management.
- **Intelligent Detection**: Automatically detects and helps install Roblox Studio if missing.

## 🚀 Getting Started

### Prerequisites

To contribute to or build MoonLight, you'll need:
- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- A code editor like [WebStorm](https://www.jetbrains.com/webstorm/) or [VS Code](https://code.visualstudio.com/)

### Installation

Currently, MoonLight is in an **Experimental Alpha** stage. Stable builds are coming soon. To run from source:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ParafieldDevelopment/MoonLight.git
   cd MoonLight
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   - **Windows:** `npm run start-windows`
   - **Linux:** `npm run start-linux`

## 🛠️ Project Structure

The project is organized as follows:

- **`src/main.ts`**: The main entry point of the Electron application.
- **`src/frontend/`**: Contains the UI components (HTML, CSS, Preloads).
- **`src/roblox/`**: Handles the integration with Roblox Studio, including the WebSocket server and request protocols.
- **`src/libraries/`**: Core utilities, window management, IPC registration, and rendering logic.
- **`src/windows/`**: Window-specific logic for Project Selection, Editor, Settings, and Login.
- **`dist/`**: Compiled TypeScript files and assets ready for execution.

## 💻 Technologies Used

- **Framework**: [Electron](https://www.electronjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Templating**: [EJS](https://ejs.co/)
- **Communication**: [WebSockets (ws)](https://github.com/websockets/ws)
- **Styling**: Modern CSS with animations

## 🤝 Contributing

We welcome contributions! If you'd like to help improve MoonLight:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please ensure you report any bugs by [creating an issue](https://github.com/ParafieldDevelopment/MoonLight/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ by **Parafield Studios**
