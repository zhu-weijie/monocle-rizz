import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { ensureConnected } from "@/utils/bluetooth/js/main";
import { replRawMode, replSend } from "@/utils/bluetooth/js/repl";
import { getHnTopArticleComments } from "@/utils/hacker-news/hn";
import { Button } from "antd";

const inter = Inter({ subsets: ["latin"] });

const HomeNotSsr = () => {
  const [connected, setConnected] = useState(false);
  const [hnArticleData, setHnArticleData] = useState(false); // type mixing

  useEffect(() => {
    if (Object.keys(hnArticleData).length) {
      displayHnArticleComments(hnArticleData);
    }
  }, [hnArticleData]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${inter.className} ${styles.main}`}>
        <div className="flex w-screen h-screen flex-col items-center justify-center">
          <p className="text-3xl">{connected ? "Connected" : "Disconnected"}</p>
          <Button type="primary" onClick={() => ensureConnected(logger)}>
            Connect
          </Button>
        </div>
      </main>
    </>
  );

  async function getHn() {
    const hnData = await getHnTopArticleComments();
    setHnArticleData(hnData);
  }

  function displayHnArticleComment(articleComments) {
    console.log("called");
    return new Promise((resolve) => {
      const articleIds = Object.keys(articleComments);

      if (articleIds.length) {
        const body = articleComments[articleIds[0]];

        setTimeout(async () => {
          let replCmd = "import display;";

          replCmd += `display.text("${body.title.substring(
            0,
            21
          )}", 0, 0, 0xffffff);`;
          replCmd += `display.text("${body.comment.substring(
            0,
            21
          )}", 0, 50, 0xffffff);`;
          replCmd += "display.show();";

          console.log("send", replCmd);

          await replSend(replCmd);
          delete articleComments[articleIds[0]];
          displayHnArticleComment(articleComments);
        }, 5000);
      } else {
        resolve(""); // done
      }
    });
  }

  async function displayHnArticleComments(hnArticleComments) {
    await replRawMode(true);
    await displayHnArticleComment(hnArticleComments);
  }

  async function logger(msg) {
    if (msg === "Connected") {
      setConnected(true);
    }

    getHn();
  }
};

export default HomeNotSsr;