[Setup]
AppId={{com.moonlight.ide}
AppName=MoonLight
AppVersion=0.0.0
AppPublisher=Parafield Studios
DefaultDirName={autopf}\MoonLight
DefaultGroupName=MoonLight
AllowNoIcons=yes
OutputDir=out
OutputBaseFilename=MoonLight-Setup
SetupIconFile=src\assets\iconcircle.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "out\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\MoonLight"; Filename: "{app}\MoonLight.exe"
Name: "{autodesktop}\MoonLight"; Filename: "{app}\MoonLight.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\MoonLight.exe"; Description: "{cm:LaunchProgram,MoonLight}"; Flags: nowait postinstall skipifsilent
