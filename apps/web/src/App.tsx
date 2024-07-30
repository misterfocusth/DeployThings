import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { testing, PostContract } from "@repo/contracts";

import { initClient } from "@ts-rest/core";

function App() {
  const [count, setCount] = useState(0);

  // `contract` is the AppRouter returned by `c.router`
  const client = initClient(PostContract, {
    baseUrl: import.meta.env.VITE_BASE_URL,
    baseHeaders: {},
  });

  const handleGetSamplePost = async () => {
    console.log(import.meta.env.VITE_BASE_URL);

    const { body, status } = await client.createPost({
      body: {
        title: "Post Title",
        body: "Post Body",
      },
    });

    if (status === 201) {
      // body is Post
      console.log(body);
    } else {
      // body is unknown
      console.log(body);
    }
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h1>{testing}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <button onClick={handleGetSamplePost}>Get Sample Post (ts-rest)</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
