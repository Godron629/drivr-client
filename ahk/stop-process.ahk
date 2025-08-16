#Requires AutoHotkey v2.0

usage := "Usage: stop-process.ahk <PROCESS_NAME>"

if A_Args.Length < 1 {
    FileAppend "Not enough arguments passed!`n" usage, "*"
    ExitApp 1
}

processName := A_Args[1]

pid := ProcessExist(processName)
if pid {
    ProcessClose(pid)
} else { 
    TrayTip("Process " processName " is not running.", "Error", 5) 
    FileAppend "Process " processName " is not running.", "**" 
    Exit 1
}
