import React from "react";
import { Accordion, Panel } from "rsuite";
import "rsuite/dist/rsuite.min.css";

// ===========================
// Données dynamiques (FAQ)
// ===========================
const faqData = [
  {
    id: 1,
    question: "Comment inscrire mon enfant à l’école partenaire ?",
    answer:
      "Vous pouvez remplir le formulaire d’inscription disponible sur notre site ou vous rendre directement dans l’établissement scolaire partenaire.",
  },
  {
    id: 2,
    question: "Quels types de dons sont acceptés ?",
    answer:
      "Nous acceptons les dons financiers, mais aussi les fournitures scolaires comme des livres, cahiers, stylos et uniformes.",
  },
  {
    id: 3,
    question: "Comment devenir bénévole enseignant ?",
    answer:
      "Il suffit de déposer votre candidature via notre plateforme. Après validation, vous serez contacté pour rejoindre notre équipe pédagogique.",
  },
  {
    id: 4,
    question: "Puis-je suivre l’évolution d’un élève soutenu ?",
    answer:
      "Oui, un espace dédié vous permet de recevoir des nouvelles régulières des élèves que vous soutenez.",
  },
];

// ===========================
// Composant principal
// ===========================
const FaqSection = () => {
  return (
    <section className="faq-one">
      <div
        className="faq-one__bg"
        style={{
          backgroundImage: "url(assets/images/backgrounds/faq-bg-1-1.png)",
        }}
      ></div>

      <div className="container">
        <div className="row gutter-y-60">
          {/* Partie gauche : FAQ */}
          <div className="col-lg-6">
            <div className="faq-one__content">
              <div className="sec-title text-start">
                <p className="sec-title__tagline">Questions &amp; Réponses</p>
                <h2 className="sec-title__title">
                  Foire aux questions <br /> sur l’éducation scolaire
                </h2>
              </div>

              <div className="faq-one__content__text">
                Retrouvez ici les réponses aux questions les plus fréquentes
                concernant nos programmes éducatifs, nos dons et notre engagement
                auprès des élèves.
              </div>

              {/* Accordéon React Suite */}
              <Accordion
                defaultActiveKey={0}
                bordered={false}
                className="faq-one__accordion"
              >
                {faqData.map((faq, index) => (
                  <Panel
                    key={faq.id}
                    header={
                      <div className="faq-one__accordion__header text-white" style={{border: 'none !important'}}>
                        {faq.question}
                        <span className="faq-one__accordion__icon"></span>
                      </div>
                    }
                    eventKey={index}
                    className="faq-one__accordion__item" 
                  >
                    <div className="faq-one__accordion__body">{faq.answer}</div>
                  </Panel>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Partie droite : image */}
          <div className="col-lg-6">
            <div className="faq-one__image m-0">
              <img src="assets/images/donations/donations-1-1.jpg" alt="FAQ éducation" className="w-100" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
