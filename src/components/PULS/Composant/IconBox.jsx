import React from "react";

const IconBox = ({ icon: Icon, size = 18, color = "#10b981" }) => {
  const academicYear = JSON.parse(localStorage.getItem('academicYearMain'));
  return (
    <div className={`IconBox-${academicYear?.niveauEnseignement?.libelle.replace(/[\s()]/g, '')} IconBox-niveauEnseignement-${academicYear?.niveauEnseignement?.id}`} >
      <Icon size={size}  />
    </div>
  );
};

export default IconBox;
