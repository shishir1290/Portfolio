import { AppProps } from "next/app";
import "../styles/globals.css";
import Layout from "../components/Layout";
import "animate.css";
import Head from "next/head";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}
