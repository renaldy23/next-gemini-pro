"use client";

import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { MessageCircleCode, Upload } from "lucide-react";
import { Send, Copy, Download, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/styles.module.css";

export default function Home() {
  // state for the prompt, response and output
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [output, setOutput] = useState("The response will appear here...");

  const onKeyDown = (e: any) => {
    // Check if the Ctrl key is pressed along with the Enter key
    if (e.key === "Enter") {
      // Prevent the default behavior of the Enter key (e.g., new line in textarea)
      e.preventDefault();
      // Trigger the onSubmit function
      onSubmit();
    }
  };

  const onFileChange = (e: any) => {
    // Get the file
    const file = e.target.files[0];
    // Check if the file is null
    if (!file) {
      toast.error("No file selected!");
      return;
    }
    // Read the file
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // On reader load
    reader.onload = (readerEvent) => {
      // Set the prompt to the file content
      // @ts-ignore
      setPrompt(readerEvent.result || "done");
    };
  };

  const copyToClipboard = () => {
    // Copy the output to the clipboard
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  const downloadFile = () => {
    // Create a new blob
    const blob = new Blob([output], { type: "text/plain" });
    // Create a new URL
    const url = window.URL.createObjectURL(blob);
    // Create a new anchor tag
    const anchor = document.createElement("a");
    // Set the href and download attributes for the anchor tag
    anchor.href = url;
    anchor.download = "chat.txt";
    // Click the anchor tag programmatically
    anchor.click();
    // Remove the anchor tag from the body
    anchor.remove();
    // Revoke the URL
    window.URL.revokeObjectURL(url);
  };

  const onSubmit = async () => {
    // clear the output
    setOutput("Generating response...");
    if (prompt === "") {
      toast.error("Prompt cannot be empty!");
      setOutput("The response will appear here...");
      return;
    }

    // create a post request to the /api/chat endpoint
    const response = await fetch("api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userPrompt: prompt,
      }),
    });

    // get the response from the server
    const data = await response.json();
    // set the response in the state
    setResponse(data.text);
  };

  useEffect(() => {
    // update the response character by character in the output
    if (response.length === 0) return;

    setOutput("");

    for (let i = 0; i < response.length; i++) {
      setTimeout(() => {
        setOutput((prev) => prev + response[i]);
      }, i * 10);
    }
  }, [response]);

  return (
    <main className={`flex flex-col items-center h-screen gap-4`}>
      <Toaster />
      <div className="flex gap-2 items-center mb-5">
        <MessageCircleCode size="64" />
        <span className="text-3xl font-bold">Chaty</span>
      </div>
      <div className="flex gap-2 items-center">
        <div className="relative">
          <Input
            type="text"
            placeholder="prompt"
            value={prompt}
            className={cn(
              "min-w-[320px] sm:min-w-[400px] md:min-w-[500px] h-[50px] pr-12"
            )}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            onKeyDown={(e) => onKeyDown(e)}
          />
          <button
            onClick={() => onSubmit()}
            className="absolute top-3 right-3 hover:scale-110 transition ease-in-out"
          >
            <Send />
          </button>
        </div>
        {/* <Input
          type="file"
          onChange={(e) => onFileChange(e)}
          className="hidden"
        />
        <Button
          variant="outline"
          className={cn("w-[40px] p-1")}
          onClick={() => {
            const fileInput = document.querySelector(
              "input[type=file]"
            ) as HTMLInputElement;
            fileInput.click();
          }}
        >
          <Upload className={cn("w-[20px]")} />
        </Button> */}
      </div>
      <div className="flex gap-3 items-center">
        <Card
          className={cn(
            "p-5 whitespace-normal min-w-[320px] sm:w-[500px] md:min-w-[600px] min-h-[300px] max-h-[600px] lg:min-w-[700px] overflow-y-scroll"
          )}
        >
          <div className={`${styles.textwrapper}`}>
            <Markdown className={cn("w-full h-full ")}>{`${output}`}</Markdown>
          </div>
        </Card>
        <div className="flex flex-col gap-5">
          <Button
            variant="outline"
            className={cn("w-[40px] p-1")}
            onClick={() => copyToClipboard()}
          >
            <Copy className={cn("w-[20px]")} />
          </Button>
          <Button
            variant="outline"
            className={cn("w-[40px] p-1")}
            onClick={() => downloadFile()}
          >
            <Download className={cn("w-[20px]")} />
          </Button>
          <Button
            variant="outline"
            className={cn("w-[40px] p-1")}
            onClick={() => {
              setOutput("The response will appear here...");
            }}
          >
            <XCircle className={cn("w-[20px]", "text-red-500")} />
          </Button>
        </div>
      </div>
    </main>
  );
}
