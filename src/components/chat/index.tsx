import { useCallback, useState, FormEvent } from "react";
import {
  Window,
  WindowHeader,
  WindowContent,
  TextInput,
  Button,
  ScrollView,
} from "react95";
import { Configuration, OpenAIApi } from "openai";
import styles from "./index.module.css";

export const Chat = () => {
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
    console.log("response", response);
    return response.data;
  }, [input]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input) {
      return;
    }
    requestChatCompletion().then((data) => {
      const message = data.choices[0].message?.content;
      if (message) {
        setChatMessages([...chatMessages, message.trim()]);
        setInput("");
      }
    });
  };

  return (
    <div className={styles.container}>
      <Window className={styles.chatContainer}>
        <WindowHeader>
          <h1>ChatGPT 95</h1>
        </WindowHeader>
        <WindowContent>
          <ScrollView className={styles.chatMessages}>
            {chatMessages.map((message) => (
              <pre className={styles.chatMessage}>{message}</pre>
            ))}
          </ScrollView>
          <form onSubmit={handleSubmit} className={styles.chatForm}>
            <TextInput
              className={styles.chatFormInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit">Submit</Button>
          </form>
        </WindowContent>
      </Window>
    </div>
  );
};
