import Image from "next/image";
import styles from "./page.module.scss";
import { getConfirmedPayments } from "@/lib/purchases";
import { getCampaign } from "@/lib/campaign";
import Link from "next/link";

// Forzar SSR dinámico: nunca cachear esta página.
// Así los montos y la barra siempre reflejan datos reales de Firebase.
export const revalidate = 0;

export default async function Home() {
  const confirmed = await getConfirmedPayments();
  const totalDonations = confirmed.reduce((a, b) => a + b.amount, 0);
  const campaign = await getCampaign();
  const donationsGoal = campaign.amount;
  const progressPercent = Math.round((totalDonations / donationsGoal) * 100);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <h1 className={styles.title}>Vaquitapp</h1>
        <div className={styles.goal}>
          <img
            className={styles.goalImg}
            src={campaign.image}
            alt="Campaign"
          />
          <div className={styles.goalTexts}>
            <h2 className={styles.goalTitle}>{campaign.title}</h2>
            <div className={styles.goalDonations}>
              <span className={styles.totalDonations}>${totalDonations.toLocaleString()}</span>{" "}/{" "}
              ${donationsGoal.toLocaleString()}
            </div>
            <div
              className={styles.goalProgressBar}
              style={{ "--progress": progressPercent } as any}
            ></div>
            <p className={styles.goalDesc} dangerouslySetInnerHTML={{ __html: campaign.description.replace(/\n/g, "<br>") }} />
          </div>
        </div>
        <div className={styles.donations}>
          {confirmed.map((i) => (
            <div
              key={i.id}
              className={styles.donation}
            >
              <div className={styles.donationAmount}>
                ${i.amount.toLocaleString()}
              </div>
              <div className={styles.donationText}>
                <span>
                  {i.message}
                </span>
                <span>
                  {i.from}
                </span>
              </div>
            </div>
          ))}
        </div>
        <Link href='/donate' className={styles.donateButton}>Sumate a la causa</Link>
      </div>
    </div>
  );
}
