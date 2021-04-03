import { Button, Grid, Paper, Typography, makeStyles, Container, } from "@material-ui/core";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import React from 'react';
import { useThemeDispatch } from "../context/theme/context";
import { useThemeState } from "../context/theme";
import IconButton from '@material-ui/core/IconButton';
import { useDispatch } from "react-redux";
import { setSnackbar } from "../context/snackbar/snackbar";
import { romType } from "../lib/romType"
import { expansionOption } from "../lib/expansionOption"

import AlertDialog from "../components/aboutModal"
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { autodetect } from "../lib/autodetect"
import { expand } from "../lib/expand"

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

import mainLogo from'../assets/moon.svg';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
    maxWidth: 300,
  },
  paper: {
    padding: theme.spacing(4),
    margin: "auto",
  },
  img: {
    width: "100%",
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
}));

const romExpansionOptions = [
  { size: 0x020000, expansionOption: expansionOption.AppendZeros },
  { size: 0x040000, expansionOption: expansionOption.AppendZeros },
  { size: 0x080000, expansionOption: expansionOption.AppendZeros },
  { size: 0x100000, expansionOption: expansionOption.AppendZeros },
  { size: 0x180000, expansionOption: expansionOption.AppendZeros },
  { size: 0x200000, expansionOption: expansionOption.AppendZeros },
  { size: 0x280000, expansionOption: expansionOption.AppendZeros },
  { size: 0x300000, expansionOption: expansionOption.AppendZeros },
  { size: 0x380000, expansionOption: expansionOption.AppendZeros },
  { size: 0x400000, expansionOption: expansionOption.AppendZeros },

  { size: 0x600000, isExtended: true, expansionOption: expansionOption.AppendZeros, additionalLabel: "(Normal) " },
  { size: 0x600000, isExtended: true, expansionOption: expansionOption.Mirror, additionalLabel: "(Mirror) " },

  { size: 0x800000, isExtended: true, expansionOption: expansionOption.AppendZeros, additionalLabel: "(Normal) " },
  { size: 0x800000, isExtended: true, expansionOption: expansionOption.Mirror, additionalLabel: "(Mirror) " }
];

export default function Users() {
  const classes = useStyles();
  const { theme } = useThemeState();
  const dispatchTheme = useThemeDispatch();
  const _toggleTheme = () => dispatchTheme({ type: "TOGGLE_THEME" });
  const dispatch = useDispatch();

  const [identifiedRomType, setIdentifiedRomType] = React.useState();
  const [rom, setRom] = React.useState();
  const [romFilename, setRomFilename] = React.useState();

  const changeHandlerAutoDetect = (event) => {
    let file = event.target.files[0];

    const reader = new FileReader()

    reader.onload = event => {
      const buffer = reader.result;
      const data = new Int8Array(buffer);

      let retVal = autodetect(data);

      if (retVal.romType !== romType.Invalid) {
        setRom(data);
        setIdentifiedRomType(retVal.romType);
        setRomFilename(file.name);
        setRadioButtonSelected("");

        dispatch(
          setSnackbar(
            true,
            "success",
            `ROM memory map type indentified as: ${retVal.romType}`
          )
        )
      } else {
        setIdentifiedRomType(null);
        setRomFilename(null);
        setRom(null);
        dispatch(
          setSnackbar(
            true,
            "error",
            `Cannot determine ROM memory map type. ${retVal.error}.`
          )
        )
      }
    }

    if (file !== undefined) {
      reader.readAsArrayBuffer(file);
    }
  };

  const [radioButtonSelected, setRadioButtonSelected] = React.useState('');

  // saveByteArray saves the rom as a file
  function saveByteArray(reportName, byte) {
    let a = window.document.createElement('a');

    a.href = window.URL.createObjectURL(new Blob([byte], { type: 'application/octet-stream' }));
    a.download = reportName;

    // Append anchor to body.
    document.body.appendChild(a)
    a.click();

    // Remove anchor from body
    document.body.removeChild(a)
  };

  function handleClickExpand(event) {
    let retVal = expand(rom, identifiedRomType, romExpansionOptions[radioButtonSelected]);

    if (retVal.error === "") {
      let filenameWithoutExt = romFilename.replace(/[.][^.]+$/, "");
      let filenameExt = romFilename.replace(/.*\./, "");
      let newFilename = `${filenameWithoutExt}(Expand).${filenameExt}`;

      let byteArray = retVal.romData;

      saveByteArray(newFilename, byteArray)
    } else {
      dispatch(
        setSnackbar(
          true,
          "error",
          `Error ${retVal.error}.`
        )
      )
    }
  }

  function createLabel(entry) {
    return `${entry.size / 0x020000} Mbit ${(entry.isExtended === true) ? `Ex${identifiedRomType.replace(/[0-9]/g, '').replace("Ex", '')} ${(entry.additionalLabel !== undefined) ? entry.additionalLabel : ""}` : ""}(${formatBytes(entry.size)})`;
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <>
      <Paper className={classes.paper}>
        <Grid container justify="space-between" alignItems="flex-start">
          <Grid item>
            

          <Grid container direction="row" alignItems="center">
             <Grid item>
             <img src={mainLogo}></img>
              </Grid>
            <Grid item>
            <Typography variant="h4">&nbsp;&nbsp;Lunar Expand JS</Typography>
            </Grid>
             </Grid>

          </Grid>

          <Grid item>
            <Grid container spacing={4} alignItems="center">
              <Grid item>
                <label htmlFor="upload-photo">
                  <input
                    style={{ display: 'none' }}
                    id="upload-photo"
                    name="upload-photo"
                    accept=".smc,.sfc"
                    type="file"
                    onChange={changeHandlerAutoDetect}
                  />

                  <Button color="primary" variant="contained" component="span">
                    Load Rom
                </Button>
                </label>

              </Grid>

              <Grid item>
                <AlertDialog />
              </Grid>

              <Grid item>
                <IconButton onClick={_toggleTheme}>
                  {theme === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <br />

      {
        rom ?
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container justify="space-between" alignItems="flex-start">
                <Grid item>
                  <Typography gutterBottom variant="h6">
                    Rom Info
                  </Typography>
                </Grid>
              </Grid>

              <TableContainer component={Paper}>
                <Table size="small" aria-label="collapsible table">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">{'Filename'}</TableCell>
                      <TableCell align="right">{romFilename}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">{'Rom Map Type'}</TableCell>
                      <TableCell align="right">{identifiedRomType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">{'Rom Size'}</TableCell>
                      <TableCell align="right">{formatBytes(rom.length)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          : null
      }

      <br />

      {
        identifiedRomType ?
          <Paper className={classes.paper}>
            <>
              <Grid container justify="space-between" alignItems="flex-start">
                <Grid item>
                  <Typography gutterBottom variant="h6">
                    New Size
                  </Typography>
                </Grid>
              </Grid>
              <Container>
                <Grid container spacing={1}>

                  {
                    romExpansionOptions.map((item, id) => {
                      return (
                        <>
                          {
                            item.size > rom.length &&

                              (
                                ((identifiedRomType !== romType.LoROM1 && identifiedRomType !== romType.LoROM2) && item.expansionOption !== expansionOption.ShuffleIfLoROM) ||
                                ((identifiedRomType === romType.LoROM1 || identifiedRomType === romType.LoROM2))
                              )

                              ?
                              <Grid item md={6} xs={12}>
                                <Tooltip title={item.expansionOption === expansionOption.Mirror ? 'Consider the "mirror" option as a last resort method if other options fail.' : ''} placement="bottom-start">
                                  <FormControlLabel
                                    control={<Radio color="primary" />}
                                    checked={radioButtonSelected === `${id}`}
                                    onChange={e => setRadioButtonSelected(e.target.value)}
                                    value={id}
                                    label={createLabel(item)}
                                  />
                                </Tooltip>
                              </Grid>
                              : null
                          }
                        </>
                      );
                    })
                  }
                </Grid>

                <Grid container direction="row-reverse" justify="space-between" alignItems="center">
                  <Button disabled={radioButtonSelected === ""} color="primary" variant="contained" component="span" onClick={handleClickExpand}>
                    Expand
                </Button>
                </Grid>
              </Container>
            </>
          </Paper>
          : null
      }
    </>
  );
}