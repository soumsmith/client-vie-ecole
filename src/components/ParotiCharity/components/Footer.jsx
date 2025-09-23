import React from "react";

// ===========================
// Données dynamiques du footer
// ===========================
const footerData = {
    logo: "assets/images/logo-app.png",
    description:
        "Siège : Abidjan, Côte d’Ivoire. Nous œuvrons chaque jour pour une éducation de qualité et accessible à tous.",
    links: [
        { label: "Nos programmes", url: "/programmes" },
        { label: "À propos", url: "/about" },
        { label: "Nouvelle campagne", url: "/campagne" },
        { label: "Plan du site", url: "/sitemap" },
        { label: "Événements", url: "/evenements" },
    ],
    education: [
        { label: "Soutien scolaire", url: "/soutien" },
        { label: "Bourses d’étude", url: "/bourses" },
        { label: "Accès à l’eau potable", url: "/eau" },
        { label: "Donner une éducation", url: "/education" },
        { label: "Lancer une collecte", url: "/collecte" },
    ],
    contact: {
        email: "contact@education.ci",
        phone: "+225 01 23 45 67 89",
    },
    cta: {
        text: "Soutenez l’éducation des enfants",
        button: { label: "Faire un don", url: "/donations" },
    },
    socials: [
        { icon: "fab fa-twitter", url: "#" },
        { icon: "fab fa-facebook", url: "#" },
        { icon: "fab fa-linkedin", url: "#" },
        { icon: "fab fa-instagram", url: "#" },
    ],
};

// ===========================
// Composant principal
// ===========================
const Footer = () => {
    return (
        <footer
            className="site-footer"
            style={{
                backgroundImage: "url(assets/images/footer-bg-1-1.jpg)",
            }}
        >
            {/* Partie haute */}
            <div className="site-footer__top">
                <div className="container">
                    <div className="row">
                        {/* Logo & description */}
                        <div className="col-sm-12 col-md-6 col-lg-6 col-xl-3">
                            <div className="site-footer__widget site-footer__widget__about">
                                <a href="/" className="site-footer__widget__logo">
                                    <img
                                        src={footerData.logo}
                                        width="127"
                                        height="127"
                                        alt="Logo"
                                    />
                                </a>
                                <p className="site-footer__widget__text">
                                    {footerData.description}
                                </p>
                            </div>
                        </div>

                        {/* Liens rapides */}
                        <div className="col-sm-12 col-md-6 col-lg-6 col-xl-2">
                            <div className="site-footer__widget">
                                <h3 className="site-footer__widget__title">Liens utiles</h3>
                                <ul className="list-unstyled site-footer__widget__links">
                                    {footerData.links.map((link, index) => (
                                        <li key={index}>
                                            <a href={link.url}>{link.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Éducation */}
                        <div className="col-sm-12 col-md-6 col-lg-6 col-xl-2">
                            <div className="site-footer__widget">
                                <h3 className="site-footer__widget__title">Éducation</h3>
                                <ul className="list-unstyled site-footer__widget__links">
                                    {footerData.education.map((item, index) => (
                                        <li key={index}>
                                            <a href={item.url}>{item.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="col-sm-12 col-md-6 col-lg-6 col-xl-3">
                            <div className="site-footer__widget">
                                <h3 className="site-footer__widget__title">Contact</h3>
                                <ul className="list-unstyled site-footer__widget__contact">
                                    <li>
                                        <i className="fa fa-envelope-open"></i>
                                        <a href={`mailto:${footerData.contact.email}`}>
                                            {footerData.contact.email}
                                        </a>
                                    </li>
                                    <li>
                                        <i className="fa fa-mobile"></i>
                                        <a href={`tel:${footerData.contact.phone}`}>
                                            {footerData.contact.phone}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Call to action */}
                        <div className="col-sm-12 col-md-6 col-lg-6 col-xl-2">
                            <div className="site-footer__widget site-footer__widget__cta">
                                <h3 className="site-footer__widget__title">
                                    <span>{footerData.cta.text}</span>
                                </h3>
                                <a href={footerData.cta.button.url} className="thm-btn thm-btn--two thm-btn--light">
                                    <span>{footerData.cta.button.label}</span>
                                    <i className="fa fa-heart"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partie basse */}
            <div className="site-footer__bottom">
                <div className="container">
                    <div className="site-footer__bottom__inner">
                        <p className="site-footer__bottom__text">
                            © {new Date().getFullYear()} Éducation Solidaire
                        </p>
                        <div className="site-footer__social">
                            {footerData.socials.map((social, index) => (
                                <a key={index} href={social.url}>
                                    <i className={social.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
