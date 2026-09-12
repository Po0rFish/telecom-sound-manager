import { useEffect, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { browserDemo } from "../api/browserDemo";
import { isBrowserDemo } from "../api/dataSource";
import { DEMO_MESSAGE } from "../api/demoMode";

export function DemoNotice() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isBrowserDemo || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("telecom-demo-reset");
    channel.onmessage = () => window.location.assign("/sounds");
    return () => channel.close();
  }, []);
  const reset = async () => {
    setBusy(true);
    setError("");
    try {
      await browserDemo.reset();
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("telecom-demo-reset");
        channel.postMessage("reset");
        channel.close();
      }
      window.location.assign("/sounds");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reset the demo.");
      setBusy(false);
    }
  };
  if (!isBrowserDemo) return <Alert severity="info" sx={{ mb: 2 }}>{DEMO_MESSAGE}</Alert>;
  return <>
    <Alert severity="info" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => setOpen(true)}>Reset Demo</Button>}>
      Interactive demo: changes and audio are saved only in this browser. Nothing is sent to Supabase.
    </Alert>
    <Dialog open={open} onClose={() => { if (!busy) setOpen(false); }} aria-labelledby="reset-demo-title">
      <DialogTitle id="reset-demo-title">Reset demo?</DialogTitle>
      <DialogContent>
        <DialogContentText>This removes your saved changes and uploaded audio from this browser and restores the original samples. Unsaved form changes will also be lost.</DialogContentText>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
        <Button disabled={busy} onClick={reset}>{busy ? "Resetting…" : "Reset Demo"}</Button>
      </DialogActions>
    </Dialog>
  </>;
}
