/** @format */

import { AppProps } from "next/app";
import "../styles/globals.css";
import "../styles/os-theme.css";
import Layout from "../components/Layout";
import "animate.css";
import Head from "next/head";
import { OSProvider } from "@/contexts/OSContext";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <OSProvider>
      <Layout>
        <Head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
        </Head>
        <Component {...pageProps} />
      </Layout>
    </OSProvider>
  );
}
