"use client";

import { useState } from "react";

// Config boundaries enforced across client structures
const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const CONCURRENCY_LIMIT = 2; // Controls how many parallel streams hit your Render container concurrently

interface QueueItem {
  id: string;
  file: File;
  status: "idle" | "processing" | "completed" | "failed";
  error?: string;
}

export default function AudioConverter({
  cancelAction,
}: {
  cancelAction: () => void;
}) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Queue ingestion handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    const newItems: QueueItem[] = [];

    for (const file of filesArray) {
      const uniqueId = `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

      // Local safety validation rule before queue injection
      if (file.size > MAX_FILE_SIZE_BYTES) {
        newItems.push({
          id: uniqueId,
          file,
          status: "failed",
          error: `Skipped: Exceeds maximum boundary profile (${MAX_FILE_SIZE_MB}MB).`,
        });
      } else {
        newItems.push({
          id: uniqueId,
          file,
          status: "idle",
        });
      }
    }

    setQueue((prev) => [...prev, ...newItems]);
    e.target.value = ""; // Flush DOM handle to allow re-uploads
  };

  // 2. Individual network worker stream pipeline execution
  const processFileItem = async (item: QueueItem): Promise<void> => {
    // Update queue item state to processing
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "processing" } : q)),
    );

    const formData = new FormData();
    formData.append("file", item.file);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.msg || "Server processing pipeline aborted.",
        );
      }

      // Read chunk stream down to blob configuration array
      const blob = await response.blob();

      // Resolve downloading filename properties
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${item.file.name.substring(0, item.file.name.lastIndexOf("."))}.flac`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Generate virtual system anchor to trigger clean browser disk save operations
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchorNode = document.createElement("a");
      anchorNode.href = downloadUrl;
      anchorNode.download = filename;

      document.body.appendChild(anchorNode);
      anchorNode.click();

      // Flush memory trees
      document.body.removeChild(anchorNode);
      window.URL.revokeObjectURL(downloadUrl);

      // Confirm success state inside queue hook
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "completed" } : q)),
      );
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "failed", error: err.message } : q,
        ),
      );
    }
  };

  // 3. Concurrency-limited orchestrator loop
  const startConversionQueue = async () => {
    setIsProcessing(true);

    // Dynamic capture function to extract freshest references from working memory state
    const getNextAvailableItem = (currentQueue: QueueItem[]) => {
      return currentQueue.find((item) => item.status === "idle");
    };

    // Use a mutable tracking snapshot to accurately maintain status updates during map evaluations
    let currentQueueState = [...queue];
    const activePromises = new Set<Promise<void>>();

    while (true) {
      // Fill the execution pool until we hit the concurrency limit
      while (activePromises.size < CONCURRENCY_LIMIT) {
        const nextItem = getNextAvailableItem(currentQueueState);
        if (!nextItem) break;

        // Mutate local state mirror to mark item as active
        nextItem.status = "processing";

        // Spawn async execution track
        const promise = processFileItem(nextItem).then(() => {
          activePromises.delete(promise);
        });

        activePromises.add(promise);
      }

      // Break condition: No active items remaining and no more idle work to pick up
      if (
        activePromises.size === 0 &&
        !getNextAvailableItem(currentQueueState)
      ) {
        break;
      }

      // Await the fastest resolving active task before starting the loop again to fill the empty slot
      await Promise.race(activePromises);

      // Refresh working state arrays to read recent data from async threads
      await new Promise((resolve) => setTimeout(resolve, 50)); // Tiny loop buffer
      setQueue((freshQueue) => {
        currentQueueState = freshQueue;
        return freshQueue;
      });
    }

    setIsProcessing(false);
  };

  // 4. Queue reset routine
  const clearQueue = () => {
    if (isProcessing) return;
    setQueue([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs">
      <div className="w-full max-w-lg  max-h-[85vh] overflow-auto md:max-h-full rounded-2xl bg-white text-gray-900 p-4 sm:p-5 shadow-xl border border-gray-100 space-y-3 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 rounded-xl shadow-md space-y-6 border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Batch Audio to FLAC Converter
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Files convert sequentially to preserve system stability.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="file"
              accept="audio/*"
              multiple
              disabled={isProcessing || queue.length >= 3}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Max file size boundary: 100MB</span>
              <span>
                Concurrency Throttle: Max {CONCURRENCY_LIMIT} files at once
              </span>
            </div>
          </div>

          {/* Render Workspace Queue List */}
          {queue.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto bg-gray-50">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="p-3">File Name</th>
                    <th className="p-3 w-32">Size</th>
                    <th className="p-3 w-40">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {queue.map((item) => (
                    <tr key={item.id} className="bg-white">
                      <td className="p-3 truncate max-w-xs font-medium">
                        {item.file.name}
                      </td>
                      <td className="p-3 text-gray-500">
                        {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                      </td>
                      <td className="p-3">
                        {item.status === "idle" && (
                          <span className="text-gray-400 font-medium">
                            Queued
                          </span>
                        )}
                        {item.status === "processing" && (
                          <span className="text-blue-600 font-semibold animate-pulse">
                            Converting...
                          </span>
                        )}
                        {item.status === "completed" && (
                          <span className="text-green-600 font-semibold">
                            ✓ Ready
                          </span>
                        )}
                        {item.status === "failed" && (
                          <span
                            className="text-red-500 font-medium block leading-tight text-xs"
                            title={item.error}
                          >
                            ✕ {item.error || "Failed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Primary Action Array */}
          <div className="flex gap-3">
            <button
              onClick={startConversionQueue}
              disabled={
                isProcessing || !queue.some((item) => item.status === "idle")
              }
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-md shadow transition tracking-wide"
            >
              {isProcessing ? "Processing Queue..." : "Start Batch Conversion"}
            </button>
            <button
              onClick={clearQueue}
              disabled={isProcessing || queue.length === 0}
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-600 font-medium rounded-md transition"
            >
              Clear
            </button>
            <button
              onClick={cancelAction}
              disabled={isProcessing}
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-600 font-medium rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
