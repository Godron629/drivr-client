#Requires AutoHotkey v2.0

usage := "Usage: start-process.ahk <PROCESS_NAME> [PROCESS_DIR] [PATH_PREFIX]"

if A_Args.Length < 1 {
    FileAppend "Not enough arguments passed!`n" usage, "*"
    ExitApp 1
}

processName := A_Args[1]
processDir := ""
pathPrefix := ""

if A_Args.Length > 1 {
    processDir := A_Args[2]
}

if A_Args.Length > 2 {
    pathPrefix := A_Args[3]
    ; Handle special path variables
    if (pathPrefix = "A_MyDocuments") {
        pathPrefix := A_MyDocuments
    }
    if (pathPrefix = "A_Desktop") {
        pathPrefix := A_Desktop
    }
    ; Prepend the path prefix to process name
    processName := pathPrefix "\" processName
}

try {
    Run processName, processDir
}
catch {
    TrayTip("Could not start " processName ": " OSError(A_LastError).Message, "Error", 5)
    FileAppend("Could not start " processName ": " OSError(A_LastError).Message, "**")
    Exit 1
}
