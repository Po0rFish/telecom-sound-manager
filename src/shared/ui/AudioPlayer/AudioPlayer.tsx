import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Stack } from "@mui/material";

let activePlayer: HTMLAudioElement | null = null;

interface AudioPlayerProps {
  src: string;
  label: string;
}

function Player({ src, label }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      if (activePlayer === audio) activePlayer = null;
    };
  }, []);

  return (
    <Stack spacing={1}>
      <Box
        component="audio"
        ref={audioRef}
        src={src}
        controls
        preload="none"
        aria-label={label}
        sx={{ width: "100%", minWidth: 0 }}
        onPlay={event => {
          if (activePlayer && activePlayer !== event.currentTarget) activePlayer.pause();
          activePlayer = event.currentTarget;
        }}
        onError={() => setFailed(true)}
      />
      {failed ? (
        <Alert severity="warning">Audio could not be played. The file may be unavailable or unsupported.</Alert>
      ) : (
        <Button size="small" sx={{ alignSelf: "flex-start" }} onClick={() => {
          if (audioRef.current) audioRef.current.currentTime = 0;
        }}>Restart from beginning</Button>
      )}
    </Stack>
  );
}

export function AudioPlayer(props: AudioPlayerProps) {
  return props.src ? <Player key={props.src} {...props} /> : null;
}
