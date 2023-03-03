import { useCallback, useState, FormEvent } from "react";
import { Configuration, OpenAIApi } from "openai";
import styles from "./index.module.css";

export const Chat = () => {
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const requestChatCompletion = useCallback(async () => {
    console.log("REACT_APP_OPENAI_ORG_ID", process.env.REACT_APP_OPENAI_ORG_ID);
    console.log("REACT_APP_OPENAI_SECRET", process.env.REACT_APP_OPENAI_SECRET);
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
        setChatMessages([...chatMessages, message]);
      }
    });
  };

  return (
    <section className={styles.container}>
      <header>
        <h3>OpenAI Chat Prototype</h3>
      </header>
      <div className={styles.chatMessages}>
        {chatMessages.map((message) => (
          <pre className={styles.chatMessage}>{message}</pre>
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <input
          className={styles.chatFormInput}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </section>
  );
};
