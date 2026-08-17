"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import WaveSurfer from "wavesurfer.js";
import Hover from "wavesurfer.js/dist/plugins/hover.esm.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";

import { useTheme } from "@/components/theme-provider";
import { clamp, formatTimestamp, parseTimestamp } from "@/lib/time-utils";

const AUDIO_EXTENSION = /\.(aac|aiff|amr|flac|m4a|mp3|mp4|ogg|opus|wav|webm)$/i;
const RESUME_REWIND_SECONDS = 2;
const MEDIA_SESSION_ACTIONS = [
  "play",
  "pause",
  "seekbackward",
  "seekforward",
  "seekto",
] as const satisfies readonly MediaSessionAction[];

function isAudioFile(file: File) {
  return file.type.startsWith("audio/") || AUDIO_EXTENSION.test(file.name);
}

function getWaveformColors() {
  const rootStyles = getComputedStyle(document.documentElement);

  return {
    progressColor:
      rootStyles.getPropertyValue("--waveform-progress").trim() || "#4f7fe8",
    waveColor: rootStyles.getPropertyValue("--waveform").trim() || "#94a3b8",
  };
}

function clearMediaSession() {
  if (!("mediaSession" in navigator)) {
    return;
  }

  for (const action of MEDIA_SESSION_ACTIONS) {
    try {
      navigator.mediaSession.setActionHandler(action, null);
    } catch {
      // Some browsers expose Media Session without supporting every action.
    }
  }

  navigator.mediaSession.metadata = null;
}

export function useAudioPlayer() {
  const { resolvedTheme } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMutedRef = useRef(false);
  const playbackRateRef = useRef(1);
  const resumeRewindPendingRef = useRef(false);
  const volumeRef = useRef(1);
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [timeInput, setTimeInput] = useState("00:00:00");
  const [volume, setVolume] = useState(1);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextTime = clamp(seconds, 0, durationRef.current || 0);
    resumeRewindPendingRef.current = false;
    audio.currentTime = nextTime;
    currentTimeRef.current = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const resumeAudio = useCallback((audio: HTMLAudioElement) => {
    if (resumeRewindPendingRef.current) {
      const nextTime = clamp(
        audio.currentTime - RESUME_REWIND_SECONDS,
        0,
        audio.duration || 0,
      );
      audio.currentTime = nextTime;
      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);
    }

    resumeRewindPendingRef.current = false;
    return audio.play();
  }, []);

  const seekBy = useCallback(
    (seconds: number) => {
      seekTo(currentTimeRef.current + seconds);
    },
    [seekTo],
  );

  const jumpToTimestamp = useCallback(
    (seconds: number) => {
      if (!audioRef.current) {
        toast.info("Open an audio file first.");
        return;
      }

      seekTo(seconds);
    },
    [seekTo],
  );

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      toast.info("Open an audio file first.");
      return;
    }

    if (audio.paused) {
      void resumeAudio(audio).catch(() => {
        toast.error("The browser could not start audio playback.");
      });
    } else {
      audio.pause();
    }
  }, [resumeAudio]);

  useEffect(() => {
    if (!file || !waveformRef.current) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const audio = document.createElement("audio");
    audio.src = objectUrl;
    audio.preload = "metadata";
    audio.volume = volumeRef.current;
    audio.muted = isMutedRef.current;
    audio.playbackRate = playbackRateRef.current;
    audioRef.current = audio;
    setIsLoading(true);
    setError(null);

    const { progressColor, waveColor } = getWaveformColors();
    const waveSurfer = WaveSurfer.create({
      container: waveformRef.current,
      media: audio,
      height: 92,
      waveColor,
      progressColor,
      cursorColor: progressColor,
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      dragToSeek: true,
      normalize: true,
      plugins: [Timeline.create({ height: 18 }), Hover.create()],
    });
    waveSurferRef.current = waveSurfer;

    const handleDuration = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      durationRef.current = nextDuration;
      setDuration(nextDuration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => {
      currentTimeRef.current = audio.currentTime;
      setCurrentTime(audio.currentTime);
    };
    const handlePlay = () => {
      resumeRewindPendingRef.current = false;
      setIsPlaying(true);
    };
    const handlePause = () => {
      resumeRewindPendingRef.current = audio.currentTime > 0 && !audio.ended;
      setIsPlaying(false);
    };
    const handleEnded = () => {
      resumeRewindPendingRef.current = false;
      setIsPlaying(false);
    };
    const handleSeeking = () => {
      resumeRewindPendingRef.current = false;
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError("This audio format could not be decoded by the browser.");
    };

    audio.addEventListener("durationchange", handleDuration);
    audio.addEventListener("loadedmetadata", handleDuration);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("seeking", handleSeeking);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    waveSurfer.on("error", handleError);
    audio.load();

    if ("mediaSession" in navigator) {
      if ("MediaMetadata" in window) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: file.name,
          artist: "Transcript Desk",
        });
      }

      const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
        play: () => void resumeAudio(audio),
        pause: () => audio.pause(),
        seekbackward: (details) => {
          audio.currentTime = clamp(
            audio.currentTime - (details.seekOffset ?? 5),
            0,
            audio.duration || 0,
          );
        },
        seekforward: (details) => {
          audio.currentTime = clamp(
            audio.currentTime + (details.seekOffset ?? 5),
            0,
            audio.duration || 0,
          );
        },
        seekto: (details) => {
          if (details.seekTime !== undefined) {
            audio.currentTime = clamp(details.seekTime, 0, audio.duration || 0);
          }
        },
      };

      for (const action of MEDIA_SESSION_ACTIONS) {
        try {
          navigator.mediaSession.setActionHandler(action, handlers[action] ?? null);
        } catch {
          // Some browsers expose Media Session without supporting every action.
        }
      }
    }

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
      audio.pause();
      audio.removeEventListener("durationchange", handleDuration);
      audio.removeEventListener("loadedmetadata", handleDuration);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("seeking", handleSeeking);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      URL.revokeObjectURL(objectUrl);
      clearMediaSession();
    };
  }, [file, resumeAudio]);

  useEffect(() => {
    const waveSurfer = waveSurferRef.current;

    if (!waveSurfer) {
      return;
    }

    const { progressColor, waveColor } = getWaveformColors();
    waveSurfer.setOptions({
      cursorColor: progressColor,
      progressColor,
      waveColor,
    });
  }, [resolvedTheme]);

  const openAudioFile = (nextFile: File | undefined) => {
    if (!nextFile) {
      return;
    }

    if (!isAudioFile(nextFile)) {
      toast.error("Choose a supported audio file.");
      return;
    }

    setFile(nextFile);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setDuration(0);
    durationRef.current = 0;
    setIsPlaying(false);
    resumeRewindPendingRef.current = false;
    setError(null);
  };

  const clearAudio = () => {
    setFile(null);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setDuration(0);
    durationRef.current = 0;
    setIsPlaying(false);
    resumeRewindPendingRef.current = false;
    setError(null);
    setTimeInput("00:00:00");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updatePlaybackRate = (value: string | null) => {
    const nextRate = Number(value);

    if (!Number.isFinite(nextRate)) {
      return;
    }

    setPlaybackRate(nextRate);
    playbackRateRef.current = nextRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const updateVolume = (values: number | readonly number[]) => {
    const nextVolume = Array.isArray(values) ? values[0] : values;

    if (nextVolume === undefined) {
      return;
    }

    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    volumeRef.current = nextVolume;
    isMutedRef.current = nextVolume === 0;
    if (audioRef.current) {
      audioRef.current.volume = nextVolume;
      audioRef.current.muted = nextVolume === 0;
    }
  };

  const toggleMuted = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const beginEditingTime = () => {
    setTimeInput(formatTimestamp(currentTimeRef.current));
    setIsEditingTime(true);
  };

  const jumpToTime = () => {
    if (!isEditingTime) {
      return;
    }

    const parsedTime = parseTimestamp(timeInput);

    if (parsedTime === null) {
      toast.error("Use a time such as 00:12:34.");
      setTimeInput(formatTimestamp(currentTimeRef.current));
      setIsEditingTime(false);
      return;
    }

    seekTo(parsedTime);
    setIsEditingTime(false);
  };

  const copyTimestamp = () => {
    const timestamp = `[${formatTimestamp(currentTimeRef.current)}]`;
    void navigator.clipboard.writeText(timestamp).then(
      () => toast.success("Timestamp copied."),
      () => toast.error("The timestamp could not be copied."),
    );
  };

  return {
    beginEditingTime,
    clearAudio,
    copyTimestamp,
    currentTime,
    currentTimeRef,
    duration,
    error,
    file,
    fileInputRef,
    isEditingTime,
    isLoading,
    isMuted,
    isPlaying,
    jumpToTimestamp,
    jumpToTime,
    openAudioFile,
    playbackRate,
    seekBy,
    seekTo,
    setTimeInput,
    timeInput,
    toggleMuted,
    togglePlayback,
    updatePlaybackRate,
    updateVolume,
    volume,
    waveformRef,
  };
}
