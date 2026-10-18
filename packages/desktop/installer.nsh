; NSIS alone owns install/upgrade/uninstall. Preserve per-user registrations.
!macro customInstall
  CreateDirectory "$DESKTOP\HubX Apps"
  CreateShortCut "$DESKTOP\HubX Apps\HubX.lnk" "$INSTDIR\HubX.exe"
!macroend
!macro customUnInstall
  Delete "$DESKTOP\HubX Apps\HubX.lnk"
  RMDir "$DESKTOP\HubX Apps"
!macroend
