#Requires AutoHotkey v2.0

usage := "Usage: send-keystroke.ahk <PROCESS_NAME> <KEY_STROKE>"

if A_Args.Length < 1 {
    FileAppend "Not enough arguments passed!`n" usage, "*"
    ExitApp 1
}

processName := A_Args[1]
keystroke := A_Args[2]

pid := ProcessExist(processName)
if !pid {
    TrayTip("Process " processName " is not running.", "Error", 5) 
    FileAppend "Process " processName " is not running.", "**" 
    Exit 1
}

WinActivate("ahk_pid " pid)

Send(keystroke)