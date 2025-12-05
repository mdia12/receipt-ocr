import {
  Button,
  Section,
  Text,
  Heading,
} from "@react-email/components";
import * as React from "react";
import { PrimaryLayout } from "./layouts/PrimaryLayout";

export const DriveConnectedEmail = ({ email }: { email: string }) => {
  return (
    <PrimaryLayout previewText="Google Drive est maintenant connecté à ton compte NovaReceipt.">
      <Heading style={h1}>Google Drive est bien connecté ✅</Heading>
      
      <Text style={text}>
        Bonne nouvelle, ta connexion Google Drive est active sur NovaReceipt.
      </Text>

      <Text style={text}>
        À partir de maintenant, tes reçus scannés pourront être automatiquement sauvegardés dans ton dossier dédié sur Google Drive.
      </Text>

      <Section style={section}>
        <Text style={text}>Ce que tu peux faire maintenant :</Text>
        <ul style={list}>
          <li style={listItem}>Scanner un ticket depuis NovaReceipt.</li>
          <li style={listItem}>Retrouver automatiquement les fichiers dans le dossier NovaReceipt de ton Drive.</li>
          <li style={listItem}>Exporter facilement tes données pour ta comptabilité.</li>
        </ul>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href="https://novareceipt.com/dashboard">
          Scanner un nouveau reçu
        </Button>
      </Section>

      <Text style={text}>
        Si tu n’es pas à l’origine de cette action, pense à révoquer l’accès dans tes paramètres et contacte le support.
      </Text>
    </PrimaryLayout>
  );
};

export default DriveConnectedEmail;

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
