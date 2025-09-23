import React from 'react';
import { navigationData, mobileNavData, siteConfig } from '../data/siteData';

// ===========================
// COMPOSANT MOBILE MENU ITEM
// ===========================
const MobileMenuItem = ({ item, level = 0 }) => {
  const hasChildren = item.hasChildren && item.children;
  const itemClass = `${hasChildren ? 'menu-item-has-children' : ''} ${item.current ? 'current' : ''}`.trim();

  return (
    <li className={itemClass}>
      <a href={item.link}>{item.text}</a>
      {hasChildren && (
        <ul>
          {item.children.map((child) => (
            <MobileMenuItem key={child.id} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

// ===========================
// COMPOSANT MOBILE CONTACT INFO
// ===========================
const MobileContactInfo = ({ contacts }) => {
  return (
    <div className="mobile-nav__contact">
      <h4 className="mobile-nav__contact__title">Contact Info</h4>
      <ul className="mobile-nav__contact__list">
        {contacts.map((contact) => (
          <li key={contact.id}>
            <i className={contact.icon}></i>
            {contact.link ? (
              <a href={contact.link}>{contact.text}</a>
            ) : (
              <span>
                {contact.text}
                {contact.subtext && <br />}
                {contact.subtext}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ===========================
// COMPOSANT MOBILE SOCIAL
// ===========================
const MobileSocial = ({ social }) => {
  return (
    <div className="mobile-nav__social">
      {social.map((item) => (
        <a key={item.id} href={item.link}>
          <i className={item.icon}></i>
        </a>
      ))}
    </div>
  );
};

// ===========================
// COMPOSANT MOBILE NAV PRINCIPAL
// ===========================
const MobileNav = () => {
  const { mainMenu } = navigationData;
  const { contact, social } = mobileNavData;

  return (
    <div className="mobile-nav__wrapper">
      <div className="mobile-nav__overlay mobile-nav__toggler"></div>
      <div className="mobile-nav__content">
        <span className="mobile-nav__close mobile-nav__toggler">
          <i className="fa fa-times"></i>
        </span>

        <div className="logo-box">
          <a href="index.html" aria-label="logo image">
            <img src={siteConfig.logo} width="127" height="49" alt={siteConfig.logoAlt} />
          </a>
        </div>

        <div className="mobile-nav__container">
          <ul className="mobile-menu__list">
            {mainMenu.map((item) => (
              <MobileMenuItem key={item.id} item={item} />
            ))}
          </ul>
        </div>

        <MobileContactInfo contacts={contact} />
        <MobileSocial social={social} />
      </div>
    </div>
  );
};

export default MobileNav;
