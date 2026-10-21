param([ValidateSet('dev','preview')][string]$Mode='dev')
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $MyInvocation.MyCommand.Path
$taskPort=if($Mode -eq 'dev'){5173}else{4173}
$taskListener=Get-NetTCPConnection -LocalPort $taskPort -State Listen -ErrorAction SilentlyContinue
if($taskListener){Write-Output "Port $taskPort already has a listener (PID $($taskListener.OwningProcess)); no process was stopped.";exit 0}
New-Item -ItemType Directory -Path (Join-Path $taskRoot '.qa') -Force | Out-Null
$taskArgs=@((Join-Path $taskRoot 'node_modules/vite/bin/vite.js'))
if($Mode -eq 'preview'){$taskArgs+= 'preview'}
$taskArgs+=@('--host','127.0.0.1','--port',"$taskPort",'--strictPort')
$taskProcess=Start-Process -FilePath (Get-Command node).Source -ArgumentList $taskArgs -WorkingDirectory $taskRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskRoot ".qa/$Mode.out.log") -RedirectStandardError (Join-Path $taskRoot ".qa/$Mode.err.log")
@{pid=$taskProcess.Id;mode=$Mode;port=$taskPort;project=$taskRoot}|ConvertTo-Json|Set-Content (Join-Path $taskRoot ".qa/$Mode-server.json")
Write-Output "LATENT $Mode server: http://localhost:$taskPort (PID $($taskProcess.Id))."
