import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={handleClickOpen}>
        About
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>{"About"}</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ textAlign: 'center' }}>
            This program is not endorsed or supported by Nintendo, and the author is not affiliated with any other corporate entity.<br />
            The program is freeware and provided "AS IS"...<br />
            The author cannot be held liable for damages of any kind arising from its use or presence.<br /><br />
            JavaScript Port Based on this Version:<br />
            Version 1.14<br />
            Public Build --- May 22 2010<br /><br />
            Originally By: FuSoYa<br />
            Ported By: FCandChill
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}