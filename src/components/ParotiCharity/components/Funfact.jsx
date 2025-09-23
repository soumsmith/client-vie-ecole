import React from "react";
import { funfactData } from "../data/siteData";

// ===========================
// COMPOSANT FUNFACT ITEM
// ===========================
const FunfactItem = ({ stat }) => {
  const itemStyle = stat.accentColor
    ? { "--accent-color": stat.accentColor }
    : {};

  return (
    <>
      {/* jjjj */}
      <li className="funfact-two__list__item" style={itemStyle}>
        <div className="funfact-two__list__icon">
          <i className={stat.icon}></i>
        </div>
        {/* /.funfact-two__list__icon */}
        <h3 className="funfact-two__list__count count-box counted">
          <span className="count-text" data-stop={stat.count} data-speed={1500}>
            {stat.count.toLocaleString()}
          </span>
          {/* /.count-text */}
        </h3>
        {/* /.funfact-two__list__count count-box */}
        <p className="funfact-two__list__text">{stat.title}</p>
        {/* /.funfact-two__list__text */}
      </li>
    </>
  );
};

// ===========================
// COMPOSANT FUNFACT PRINCIPAL
// ===========================
const Funfact = () => {
  const { backgroundImage, section, stats } = funfactData;

  return (
    <section
      className="funfact-two sec-pad-top sec-pad-bottom"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="funfact-two__shape"></div>

      <div className="container">
        <div className="sec-title text-center">
          <p className="sec-title__tagline">{section.tagline}</p>
          <h2 className="sec-title__title">{section.title}</h2>
        </div>

        <ul className="list-unstyled funfact-two__list">
          {stats.map((stat) => (
            <FunfactItem key={stat.id} stat={stat} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Funfact;
