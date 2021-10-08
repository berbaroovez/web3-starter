import Head from "next/head";
import styles from "../styles/Home.module.css";

import { useEffect, useState, useRef } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import { useWeb3React, Web3ReactProvider } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { Web3Provider } from "@ethersproject/providers";
import useLocalStorage from "../hooks/useLocalStorage";

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });
const wcConnector = new WalletConnectConnector({
  infuraId: "517bf3874a6848e58f99fa38ccf9fce4",
});

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  // library.pollingInterval = 12000;
  return library;
}

export default function WrapperHome() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Home />
    </Web3ReactProvider>
  );
}

function Home() {
  const web3React = useWeb3React();
  const { active, activate, error } = web3React;
  const [loaded, setLoaded] = useState(false);

  const [latestOp, setLatestOp] = useLocalStorage("latest_op", "");
  const [latestConnector, setLatestConnector] = useLocalStorage(
    "latest_connector",
    ""
  );
  console.log(web3React);

  useEffect(() => {
    console.log("use effect called", web3React.active);
    if (latestOp == "connect" && latestConnector == "injected") {
      injected
        .isAuthorized()
        .then((isAuthorized) => {
          setLoaded(true);
          if (isAuthorized && !web3React.active && !web3React.error) {
            web3React.activate(injected);
          }
        })
        .catch(() => {
          console.log("Inside catch");
          setLoaded(true);
        });
    } else if (latestOp == "connect" && latestConnector == "wcconnector") {
      web3React.activate(wcConnector);
    }
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>web3 starter</title>
        <meta name="description" content="web3 starter nextjs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        onClick={() => {
          console.log("metamask clicked");
          console.log(injected);
          setLatestConnector("injected");
          setLatestOp("connect");
          web3React.activate(injected);
        }}
      >
        connect to metamask
      </div>
      <div
        onClick={() => {
          setLatestConnector("wcconnector");
          setLatestOp("connect");
          web3React.activate(wcConnector);
        }}
      >
        walletconnect
      </div>
      {web3React.active ? <div>Connected as {web3React.account}</div> : null}
      {web3React.active ? (
        <div
          onClick={() => {
            console.log("disconnect clicked");
            setLatestOp("disconnect");
            web3React.deactivate();
          }}
        >
          disconnect
        </div>
      ) : null}
    </div>
  );
}
