import { useCallback, useState, FormEvent, useEffect, useRef } from "react";
import {
  Window,
  WindowHeader,
  WindowContent,
  TextInput,
  Button,
  ScrollView,
  Separator,
  ProgressBar,
} from "react95";
import { Configuration, OpenAIApi } from "openai";
import styles from "./index.module.css";

export const Chat = () => {
  let updateProgressTimer = useRef<NodeJS.Timer>();
  const [loadingProgress, setLoadingProgress] = useState<number>(-1);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const requestChatCompletion = useCallback(async () => {
    const configuration = new Configuration({
      organization: process.env.REACT_APP_OPENAI_ORG_ID,
      apiKey: process.env.REACT_APP_OPENAI_SECRET,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: input }],
    });
    return response.data;
  }, [input]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input) {
      return;
    }
    startLoading();
    requestChatCompletion().then((data) => {
      const message = data.choices[0].message?.content;
      if (message) {
        setChatMessages([...chatMessages, message.trim()]);
        setInput("");
        endLoading();
      }
    });
  };

  const startLoading = () => {
    setLoadingProgress(0);
  };

  const endLoading = () => {
    setLoadingProgress(100);
    setTimeout(() => {
      setLoadingProgress(-1);
    }, 1000);
  };

  useEffect(() => {
    if (loadingProgress === -1 || 100 <= loadingProgress) {
      if (updateProgressTimer.current)
        clearTimeout(updateProgressTimer.current);
      return;
    }
    updateProgressTimer.current = setTimeout(() => {
      console.log("increase progress");
      setLoadingProgress(Math.min(loadingProgress + 10, 100));
    }, 500);
  }, [loadingProgress]);

  return (
    <div className={styles.container}>
      <Window className={styles.chatContainer}>
        <WindowHeader>
          <h1>ChatGPT 95</h1>
        </WindowHeader>
        <WindowContent>
          {loadingProgress > -1 ? (
            <div className={styles.chatLoading}>
              <ProgressBar value={loadingProgress} />
            </div>
          ) : (
            <ScrollView className={styles.chatMessages}>
              {chatMessages.map((message, index) => (
                <div key={index}>
                  {index > 0 && <Separator />}
                  <pre className={styles.chatMessage}>{message}</pre>
                </div>
              ))}
            </ScrollView>
          )}
          <form onSubmit={handleSubmit} className={styles.chatForm}>
            <TextInput
              className={styles.chatFormInput}
              placeholder="Enter your prompt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" disabled={loadingProgress > -1}>
              Submit
            </Button>
          </form>
        </WindowContent>
      </Window>
    </div>
  );
};
