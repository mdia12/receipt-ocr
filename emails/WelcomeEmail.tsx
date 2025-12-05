import {
  Button,
  Section,
  Text,
  Heading,
} from "@react-email/components";
import * as React from "react";
import { PrimaryLayout } from "./layouts/PrimaryLayout";

export const WelcomeEmail = ({ email }: { email: string }) => {
  return (
    <PrimaryLayout previewText="Bienvenue sur NovaReceipt – Commence à scanner tes reçus en quelques secondes.">
      <Heading style={h1}>Bienvenue sur NovaReceipt 👋</Heading>
      
      <Text style={text}>
        Merci d’avoir rejoint NovaReceipt ! Tu peux maintenant centraliser, organiser et exporter tous tes reçus et factures en quelques clics.
      </Text>

      <Section style={section}>
        <Text style={text}>Voici les étapes pour bien démarrer :</Text>
        <ul style={list}>
          <li style={listItem}>Connecte-toi à ton espace NovaReceipt.</li>
          <li style={listItem}>(Optionnel) Connecte ton Google Drive pour activer la sauvegarde automatique.</li>
          <li style={listItem}>Scanne ton premier ticket : photo ou PDF, tout fonctionne.</li>
          <li style={listItem}>Télécharge ton export Excel ou CSV pour ta comptabilité.</li>
        </ul>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href="https://novareceipt.com">
          Accéder à mon espace
        </Button>
      </Section>

      <Text style={text}>
        Tu peux commencer gratuitement. Si tu as la moindre question, il te suffit de répondre à cet email — nous sommes là pour t’aider.
      </Text>

      <Text style={signature}>
        À très vite,<br />
        L’équipe NovaReceipt
      </Text>
    </PrimaryLayout>
  );
};

export default WelcomeEmail;

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const section = {
  marginBottom: "24px",
};

const list = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  paddingLeft: "20px",
};

const listItem = {
  marginBottom: "10px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  maxWidth: "240px",
  margin: "0 auto",
  padding: "12px",
};

const signature = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  marginTop: "20px",
};
