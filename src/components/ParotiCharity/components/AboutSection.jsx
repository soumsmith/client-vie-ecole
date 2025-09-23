import React from "react";

// ===========================
// Données dynamiques (items de droite)
// ===========================
const aboutItems = [
  {
    id: 1,
    icon: "paroti-icon-peace",
    title: "Soutien scolaire",
    tagline: "Accompagnement des élèves",
    color: "var(--paroti-base)",
    delay: "000ms",
  },
  {
    id: 2,
    icon: "paroti-icon-praying",
    title: "Encadrement",
    tagline: "Un suivi personnalisé",
    color: "var(--paroti-secondary)",
    delay: "100ms",
  },
  {
    id: 3,
    icon: "paroti-icon-peace-1",
    title: "Bénévoles",
    tagline: "Rejoignez nos enseignants volontaires",
    color: "var(--paroti-primary)",
    delay: "200ms",
  },
  {
    id: 4,
    icon: "paroti-icon-heart",
    title: "Donations",
    tagline: "Offrez des livres et du matériel scolaire",
    color: "#8139e7",
    delay: "300ms",
  },
];

// ===========================
// Composant principal
// ===========================
const AboutSection = () => {
  return (
    <section className="sec-pad-top sec-pad-bottom about-five">
      <div className="container">
        <div className="row gutter-y-60">
          {/* Partie gauche */}
          <div className="col-md-12 col-lg-6">
            <div className="about-five__content">
              <div className="sec-title text-start">
                <p className="sec-title__tagline">Prêts à éduquer</p>
                <h2 className="sec-title__title">
                  Nous croyons qu’ensemble <br /> nous pouvons changer des vies
                </h2>
              </div>

              <div className="about-five__text">
                L’éducation est la clé pour offrir un avenir meilleur aux enfants. 
                Grâce à la solidarité, nous aidons chaque élève à réussir son parcours scolaire 
                et à développer son plein potentiel.
              </div>

              <blockquote className="about-five__blockquote">
                <i className="paroti-icon-quote"></i>
                "Chaque enfant a droit à une éducation de qualité, 
                et c’est ensemble que nous pouvons rendre cela possible."
              </blockquote>

              <div className="about-five__person">
                <div className="about-five__person__image">
                  <img
                    src="/assets/images/resources/about-2-1.png" width={80} height={80}
                    alt="Directeur"
                  />
                </div>
                <div className="about-five__person__content">
                  <h3 className="about-five__person__title">Jean Dupont</h3>
                  <p className="about-five__person__designation">
                    Directeur &amp; Fondateur
                  </p>
                </div>
              </div>

              <div className="about-five__content__arrow float-bob-x"></div>
            </div>
          </div>

          {/* Partie droite (items dynamiques) */}
          <div className="col-md-12 col-lg-6">
            <div className="row gutter-y-30">
              {aboutItems.map((item) => (
                <div
                  key={item.id}
                  className="col-sm-12 col-md-6 wow fadeInUp animated"
                  data-wow-duration="1500ms"
                  data-wow-delay={item.delay}
                >
                  <div
                    className="about-five__item"
                    style={{ "--accent-color": item.color }}
                  >
                    <div className="about-five__item__icon">
                      <i className={item.icon}></i>
                    </div>
                    <h3 className="about-five__item__title">
                      <a href="#">{item.title}</a>
                    </h3>
                    <p className="about-five__item__tagline">{item.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
