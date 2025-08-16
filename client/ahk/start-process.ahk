#Requires AutoHotkey v2.0

usage := "Usage: start-process.ahk <PROCESS_NAME> <PROCESS_DIR>"

if A_Args.Length < 1 {
    FileAppend "Not enough arguments passed!`n" usage, "*"
    ExitApp 1
}

processName := A_Args[1]
processDir := ""
if A_Args.Length > 1 {
    processDir := A_Args[2]
}

try {
    Run processName, processDir
}
catch {
    TrayTip("Could not start " processName ": " OSError(A_LastError).Message, "Error", 5)
    FileAppend("Could not start " processName ": " OSError(A_LastError).Message, "**")
    Exit 1
}
