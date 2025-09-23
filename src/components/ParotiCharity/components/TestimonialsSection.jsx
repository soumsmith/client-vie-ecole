import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

// ===========================
// Données dynamiques
// ===========================
const sectionData = {
  tagline: "Nos témoignages",
  title: "Ce qu’ils disent de nous",
  description:
    "L’éducation transforme des vies. Découvrez les retours d’enseignants, parents et élèves qui bénéficient de notre accompagnement scolaire.",
  buttonText: "Voir tous les témoignages",
  buttonLink: "/temoignages",
};

const testimonialsData = [
  {
    id: 1,
    name: "FOFANA MOHAMED",
    job: "Etudiant",
    quote:
      "Cette application m'a beaucoup aidée à rester organisée tout au long de l'année scolaire. Je peux facilement consulter mon emploi du temps, accéder aux notes des cours et même communiquer avec mes professeurs. Cela m'évite tellement de tracas par rapport aux méthodes traditionnelles. Je la recommande à tous mes camarades d'études.",
    image:
      "https://gaviaspreview.com/wp/paroti/wp-content/plugins/paroti-themer/elementor/assets/images/testimonial.jpg",
  },
  {
    id: 2,
    name: "KOUAKOU ANGE MICKAEL",
    job: "Etudiant",
    quote:
      "Un outil indispensable pour les étudiants. Grâce à cette application, j'ai pu suivre mes progrès scolaires en temps réel et soumettre mes devoirs en ligne. La possibilité de recevoir des notifications sur les examens ou les devoirs à rendre est un vrai plus. C'est devenu un outil indispensable pour mes études. En plus, l'interface est très agréable et facile à utiliser.",
    image:
      "https://gaviaspreview.com/wp/paroti/wp-content/plugins/paroti-themer/elementor/assets/images/testimonial.jpg",
  },
  {
    id: 3,
    name: "SANGARE MOUSSA",
    job: "Etudiant",
    quote:
      "Pratique pour suivre les résultats et les activités. Avec cette application, je peux facilement accéder à mes résultats de manière rapide et sécurisée. J'aime aussi le fait de pouvoir voir toutes les activités scolaires à venir, cela me permet de mieux planifier mon temps. C'est un excellent moyen de rester informé sans avoir à demander à plusieurs reprises des informations à l'administration.",
    image:
      "https://gaviaspreview.com/wp/paroti/wp-content/plugins/paroti-themer/elementor/assets/images/testimonial.jpg",
  },
  {
    id: 4,
    name: "AMANI BODOHIN",
    job: "Professeur de Mathématique au Collège Moderne de Bouaflé",
    quote:
      "Une grande aide pour la gestion de mes cours. En tant que professeur, cette application m'a considérablement facilité la vie. Je peux planifier mes cours, partager des ressources avec les élèves et suivre leur progression en quelques clics. La fonctionnalité de messagerie m'aide à garder un contact direct avec les étudiants, même en dehors des heures de classe. Je suis très satisfait du système.",
    image:
      "https://gaviaspreview.com/wp/paroti/wp-content/plugins/paroti-themer/elementor/assets/images/testimonial.jpg",
  },
  {
    id: 5,
    name: "KOUAME JOEL",
    job: "Professeur de Français au Collège Moderne de Seguela",
    quote:
      "Simplifie la communication avec les étudiants. Je trouve l'application très efficace pour gérer mes interactions avec les étudiants. Je peux leur envoyer des messages, des rappels et même des documents en un seul endroit. Cela m'aide à garder tout le monde à jour sans avoir à utiliser plusieurs plateformes. Je la recommande fortement à tous les enseignants.",
    image:
      "https://gaviaspreview.com/wp/paroti/wp-content/plugins/paroti-themer/elementor/assets/images/testimonial.jpg",
  },
];


// ===========================
// Composant principal
// ===========================
const TestimonialsSection = () => {
  return (
    <section id="TestimonialsSection" className="sec-pad-top sec-pad-bottom bg-light">
      <div className="container">
        <div className="row">
          {/* Partie gauche */}
          <div className="col-md-12 col-lg-6">
            <div className="content-left">
              <div className="sec-title text-start">
                <p className="sec-title__tagline">{sectionData.tagline}</p>
                <h2 className="sec-title__title">
                  {sectionData.title}
                </h2>
              </div>
              <div class="title-desc">{sectionData.description}</div>
              <div className="thm-btn thm-btn--two px-3 ">
                <a
                  href={sectionData.buttonLink}
                  className="text-white"
                >
                  <span>{sectionData.buttonText}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Partie droite */}
          <div className="col-md-12 col-lg-6 gsc-testimonial ">
            <Splide
              options={{
                type: "loop",
                perPage: 1,
                autoplay: true,
                interval: 4500,
                speed: 600,
                pauseOnHover: true,
                arrows: false,
                pagination: false,
              }}
            >
              {testimonialsData.map((testimonial) => (
                <SplideSlide key={testimonial.id}>
                  <div className="testimonial-item style-1 p-5">
                    <div className="testimonial-content">
                      <div className="testimonial-quote text-limit-3">
                        “{testimonial.quote}”
                      </div>
                      <div className="testimonial-meta">
                        <div className="about-five__person">
                          <div className="about-five__person__image">
                            <img
                              width={80}
                              height={80}
                              src={testimonial.image}
                            alt={testimonial.name}
                            />
                          </div>
                          <div className="about-five__person__content">
                            <h3 className="about-five__person__title ">{testimonial.name}</h3>
                            <p className="about-five__person__designation">{testimonial.job}</p>
                          </div>
                        </div>

                        <span className="quote-icon">
                          <i className="micon-quotes"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </SplideSlide>
              ))}
            </Splide>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
