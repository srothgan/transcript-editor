"use client";

import { forwardRef, useImperativeHandle } from "react";
import {
  AudioLines,
  Clipboard,
  Gauge,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTimestamp } from "@/lib/time-utils";
import { useAudioPlayer } from "./use-audio-player";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export type AudioPlayerHandle = {
  getCurrentTime: () => number;
  openFilePicker: () => void;
  seekBy: (seconds: number) => void;
  togglePlayback: () => void;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const AudioPlayer = forwardRef<AudioPlayerHandle>(
  function AudioPlayer(_, forwardedRef) {
    const player = useAudioPlayer();

    useImperativeHandle(
      forwardedRef,
      () => ({
        getCurrentTime: () => player.currentTimeRef.current,
        openFilePicker: () => player.fileInputRef.current?.click(),
        seekBy: player.seekBy,
        togglePlayback: player.togglePlayback,
      }),
      [player.currentTimeRef, player.fileInputRef, player.seekBy, player.togglePlayback],
    );

    return (
      <aside className="flex min-h-0 flex-col border-r bg-[var(--workspace-panel)] max-lg:border-r-0 max-lg:border-b">
        <input
          ref={player.fileInputRef}
          type="file"
          accept="audio/*,.aac,.aiff,.amr,.flac,.m4a,.mp3,.mp4,.ogg,.opus,.wav,.webm"
          className="sr-only"
          onChange={(event) => player.openAudioFile(event.target.files?.[0])}
        />

        <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
          <div className="flex min-w-0 items-center gap-2">
            <AudioLines className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Audio</h2>
            <Badge variant="outline" className="text-[0.65rem] text-muted-foreground">
              Local
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => player.fileInputRef.current?.click()}>
            <Upload data-icon="inline-start" />
            Open
          </Button>
        </div>

        {!player.file ? (
          <button
            type="button"
            className="m-3 flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card/70 px-6 text-center transition-colors hover:border-primary/40 hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/40"
            onClick={() => player.fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              player.openAudioFile(event.dataTransfer.files[0]);
            }}
          >
            <span className="grid size-10 place-items-center rounded-full border bg-background">
              <Upload className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-medium">Open an audio recording</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Choose a file or drop it here. It stays on this device.
              </span>
            </span>
          </button>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3 border-b bg-card/55 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={player.file.name}>
                  {player.file.name}
                </p>
                <p className="mt-0.5 font-mono text-[0.68rem] text-muted-foreground">
                  {formatFileSize(player.file.size)} · {formatTimestamp(player.duration)}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="ghost" size="icon-sm" onClick={player.clearAudio} />}
                >
                  <X />
                  <span className="sr-only">Close audio</span>
                </TooltipTrigger>
                <TooltipContent>Close audio</TooltipContent>
              </Tooltip>
            </div>

            <div className="px-3 pt-4">
              <div ref={player.waveformRef} className="waveform min-h-28 overflow-hidden rounded-md" />
              {player.error ? (
                <p
                  role="alert"
                  className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive"
                >
                  {player.error}
                </p>
              ) : null}
            </div>

            <div className="px-3 py-4">
              <Slider
                aria-label="Audio position"
                value={[player.currentTime]}
                min={0}
                max={player.duration || 1}
                step={0.1}
                onValueChange={(values) => {
                  const nextTime = Array.isArray(values) ? values[0] : values;
                  if (nextTime !== undefined) {
                    player.seekTo(nextTime);
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-between font-mono text-[0.68rem] text-muted-foreground">
                <span>{formatTimestamp(player.currentTime)}</span>
                <span>-{formatTimestamp(Math.max(0, player.duration - player.currentTime))}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 px-3 pb-4">
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="outline" size="icon" onClick={() => player.seekBy(-5)} />}
                >
                  <RotateCcw />
                  <span className="sr-only">Back five seconds</span>
                </TooltipTrigger>
                <TooltipContent>Back 5 seconds</TooltipContent>
              </Tooltip>
              <Button
                size="icon-lg"
                className="size-11 rounded-full shadow-sm"
                onClick={player.togglePlayback}
                aria-label={player.isPlaying ? "Pause audio" : "Play audio"}
              >
                {player.isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : player.isPlaying ? (
                  <Pause className="fill-current" />
                ) : (
                  <Play className="ml-0.5 fill-current" />
                )}
              </Button>
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="outline" size="icon" onClick={() => player.seekBy(5)} />}
                >
                  <RotateCw />
                  <span className="sr-only">Forward five seconds</span>
                </TooltipTrigger>
                <TooltipContent>Forward 5 seconds</TooltipContent>
              </Tooltip>
            </div>

            <Separator />

            <div className="grid gap-4 p-3">
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  player.jumpToTime();
                }}
              >
                <Input
                  aria-label="Jump to time"
                  value={
                    player.isEditingTime
                      ? player.timeInput
                      : formatTimestamp(player.currentTime)
                  }
                  inputMode="numeric"
                  className="h-8 font-mono text-xs tabular-nums"
                  onFocus={player.beginEditingTime}
                  onBlur={player.jumpToTime}
                  onChange={(event) => player.setTimeInput(event.target.value)}
                />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={player.copyTimestamp}
                      />
                    }
                  >
                    <Clipboard />
                    <span className="sr-only">Copy timestamp</span>
                  </TooltipTrigger>
                  <TooltipContent>Copy timestamp</TooltipContent>
                </Tooltip>
              </form>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Gauge className="size-3.5" aria-hidden="true" />
                  Speed
                </div>
                <Select
                  value={player.playbackRate.toString()}
                  onValueChange={player.updatePlaybackRate}
                >
                  <SelectTrigger size="sm" className="w-24 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAYBACK_RATES.map((rate) => (
                      <SelectItem key={rate} value={rate.toString()}>
                        {rate.toFixed(rate % 1 === 0 ? 1 : 2)}×
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={player.toggleMuted}
                  aria-label={player.isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {player.isMuted || player.volume === 0 ? <VolumeX /> : <Volume2 />}
                </Button>
                <Slider
                  aria-label="Audio volume"
                  value={[player.isMuted ? 0 : player.volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={player.updateVolume}
                />
                <span className="w-8 text-right font-mono text-[0.68rem] text-muted-foreground">
                  {Math.round((player.isMuted ? 0 : player.volume) * 100)}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  },
);
