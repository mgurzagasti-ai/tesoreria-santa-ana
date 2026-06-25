Set shell = CreateObject("WScript.Shell")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
shell.Run "cmd.exe /c """ & scriptDir & "\start-app-jorge.cmd""", 0, False
