import {
  Button,
  Section,
  Text,
  Heading,
} from "@react-email/components";
import * as React from "react";
import { PrimaryLayout } from "./layouts/PrimaryLayout";

type ScanCompletedEmailProps = {
  email: string;
  receiptName?: string;
  amount?: string;
  date?: string;
};

export const ScanCompletedEmail = ({
  email,
  receiptName,
  amount,
  date,
}: ScanCompletedEmailProps) => {
  return (
    <PrimaryLayout previewText="Ton scan est terminé – tes données sont prêtes dans NovaReceipt.">
      <Heading style={h1}>Ton scan est terminé 🎉</Heading>
      
      <Text style={text}>
        Ton reçu a bien été traité par NovaReceipt.
      </Text>

      <Section style={detailsContainer}>
        {receiptName && (
          <Text style={detailText}>
            <strong>Document :</strong> {receiptName}
          </Text>
        )}
        {amount && (
          <Text style={detailText}>
            <strong>Montant détecté :</strong> {amount}
          </Text>
        )}
        {date && (
          <Text style={detailText}>
            <strong>Date du reçu :</strong> {date}
          </Text>
        )}
      </Section>

      <Text style={text}>
        Tu peux maintenant retrouver ce reçu dans ton espace et l’inclure dans tes exports comptables.
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href="https://novareceipt.com/dashboard">
          Voir mes reçus
        </Button>
      </Section>

      <Text style={text}>
        Pense à regrouper régulièrement tes reçus pour garder une comptabilité propre et à jour.
      </Text>
    </PrimaryLayout>
  );
};

export default ScanCompletedEmail;

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

const detailsContainer = {
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  margin: "24px 0",
};

const detailText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
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
