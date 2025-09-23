/**
 * Composant de consultation du cahier de texte
 * Interface moderne et élégante pour visualiser les séances
 */

import React, { useState } from 'react';
import { 
  Panel, 
  Modal, 
  Button,
  FlexboxGrid,
  Loader,
  Message,
  Timeline,
  Tag,
  Divider,
  IconButton,
  Tooltip,
  Whisper,
  Avatar,
  Badge
} from 'rsuite';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiBook,
  FiFileText,
  FiImage,
  FiDownload,
  FiEye,
  FiBookOpen,
  FiTarget,
  FiMessageSquare,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';
import { useCahierDeTexteData } from './CahierDeTexteServiceManager';

const CahierDeTexteConsultation = ({ 
  isOpen, 
  onClose, 
  selectedClasse, 
  selectedMatiere,
  refreshTrigger,
  onRefresh,
  primaryColor,
  embedded = false // Nouveau prop pour mode intégré
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Récupération des données du cahier
  const { 
    cahierData, 
    loading, 
    error, 
    refetch 
  } = useCahierDeTexteData(
    selectedClasse?.id, 
    selectedMatiere?.matiere?.id, 
    refreshTrigger
  );

  // Fonction pour formater les observations HTML
  const formatObservations = (htmlContent) => {
    if (!htmlContent) return 'Aucune observation';
    
    // Supprimer les balises HTML pour l'affichage
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || 'Aucune observation';
  };

  // Fonction pour ouvrir une image
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  // Fonction pour télécharger un fichier
  const handleDownloadFile = (fileUrl) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileUrl.split('/').pop();
    link.click();
  };

  // Fonction pour obtenir l'icône selon le type de fichier
  const getFileIcon = (url) => {
    if (!url) return <FiFileText />;
    const extension = url.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FiImage />;
      default:
        return <FiFileText />;
    }
  };

  // Composant Card de séance
  const SeanceCard = ({ seance, index }) => {
    const hasAttachment = seance.attachmentUrl;
    const isImage = hasAttachment && /\.(jpg|jpeg|png|gif)$/i.test(seance.attachmentUrl);

    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #f1f5f9',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Badge de numéro de séance */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '20px',
          background: `linear-gradient(90deg, ${primaryColor}60, ${primaryColor}60)`,
          color: `${primaryColor}`,
          padding: '8px 16px',
          borderRadius: '0 0 12px 12px',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          <span style={{marginTop: '20px'}}>SÉANCE #{index + 1}</span>
        </div>

        {/* Header avec date et horaires */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              background: `linear-gradient(90deg, ${primaryColor}50, ${primaryColor}50)`,
              padding: '10px',
              borderRadius: '12px',
              color: `${primaryColor}`
            }}>
              <FiCalendar size={20} />
            </div>
            <div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                margin: 0,
                color: '#1e293b'
              }}>
                Séance du {seance.date}
              </h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px', 
                marginTop: '6px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                  <FiClock size={14} />
                  <span style={{ fontSize: '14px' }}>Heure: {seance.horaires}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                  <FiTarget size={14} />
                  <span style={{ fontSize: '14px' }}>Durée: {seance.duree} min</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                  <Avatar 
                    size="xs" 
                    style={{ 
                      background: `linear-gradient(90deg, ${primaryColor}10, ${primaryColor}10)`,
                      color: `${primaryColor}`
                    }}
                  >
                    {seance.professeur.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </Avatar>
                  <span style={{ fontSize: '14px' }}>Prof. {seance.professeur}</span>
                </div>
                {seance.dureeTotale && (
                  <div style={{ 
                    background: '#f0f9ff',
                    color: '#0369a1',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Durée totale: {seance.dureeTotale} min
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu en colonnes : Leçons, Observations, Fichiers */}
        {((seance.lecons && seance.lecons.length > 0) || seance.observations || hasAttachment) && (
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            alignItems: 'stretch'
          }}>
            {/* Colonne Leçons */}
            {seance.lecons && seance.lecons.length > 0 && (
              <div style={{ 
                flex: 2,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FiBookOpen size={16} style={{ color: '#8b5cf6' }} />
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    margin: 0,
                    color: '#374151'
                  }}>
                    Léçon(s) abordée(s) :
                  </h4>
                </div>
                <div style={{
                  flex: 1,
                  background: '#f8f9ff',
                  border: '2px solid #e0e7ff',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start'
                }}>
                  {seance.lecons.map((lecon, idx) => (
                    <div key={idx} style={{ 
                      marginBottom: idx === seance.lecons.length - 1 ? '0' : '12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#8b5cf6',
                        marginTop: '6px',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '4px'
                        }}>
                          {lecon.titre}
                        </div>
                        <Tag size="sm" color="blue">
                          Leçon {lecon.numLecon}
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colonne Observations */}
            {seance.observations && (
              <div style={{ 
                flex: 2,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FiMessageSquare size={16} style={{ color: '#f59e0b' }} />
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    margin: 0,
                    color: '#374151'
                  }}>
                    Observations
                  </h4>
                </div>
                <div style={{
                  flex: 1,
                  background: '#fafbfc',
                  border: '2px solid #f1f5f9',
                  borderRadius: '12px',
                  padding: '16px',
                  fontFamily: 'Georgia, serif',
                  lineHeight: '1.6',
                  color: '#374151',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ width: '100%' }}>
                    {formatObservations(seance.observations)}
                  </div>
                </div>
              </div>
            )}

            {/* Colonne Fichier joint */}
            {hasAttachment && (
              <div style={{ 
                flex: 1, // Plus petite que les autres colonnes
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  {getFileIcon(seance.attachmentUrl)}
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    margin: 0,
                    color: '#374151'
                  }}>
                    Fichier joint
                  </h4>
                </div>
                <div style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      background: isImage ? '#10b981' : '#6366f1',
                      color: 'white',
                      padding: '8px',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}>
                      {getFileIcon(seance.attachmentUrl)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '500', 
                        color: '#374151', 
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {seance.attachmentUrl.split('/').pop()}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                        {isImage ? 'Image' : 'Document'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {isImage && (
                      <Whisper
                        trigger="hover"
                        speaker={<Tooltip>Prévisualiser l'image</Tooltip>}
                      >
                        <IconButton
                          size="sm"
                          color="green"
                          appearance="primary"
                          icon={<FiEye />}
                          onClick={() => handleImageClick(seance.attachmentUrl)}
                        />
                      </Whisper>
                    )}
                    
                    <Whisper
                      trigger="hover"
                      speaker={<Tooltip>Télécharger le fichier</Tooltip>}
                    >
                      <IconButton
                        size="sm"
                        color="blue"
                        appearance="primary"
                        icon={<FiDownload />}
                        onClick={() => handleDownloadFile(seance.attachmentUrl)}
                      />
                    </Whisper>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Contenu principal du composant
  const renderContent = () => (
    <div>
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 0',
          background: 'white'
        }}>
          <Loader size="lg" content="Chargement des séances..." />
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', background: 'white' }}>
          <Message type="error">
            <strong>Erreur:</strong> {error.message}
            <div style={{ marginTop: '8px' }}>
              <Button size="sm" onClick={refetch}>
                Réessayer
              </Button>
            </div>
          </Message>
        </div>
      )}

      {!loading && !error && cahierData.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          background: 'white'
        }}>
          <FiBookOpen size={64} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
          <h3 style={{ color: '#64748b', marginBottom: '8px', fontSize: '18px' }}>
            Aucune séance enregistrée
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Ce cahier de texte ne contient pas encore de séances pour cette matière.
          </p>
        </div>
      )}

      {!loading && !error && cahierData.length > 0 && (
        <div>
          {/* Statistiques en header */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <FlexboxGrid justify="space-around" align="middle">
              <FlexboxGrid.Item>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '4px'
                  }}>
                    {cahierData.length}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                    SÉANCES EFFECTUÉES
                  </div>
                </div>
              </FlexboxGrid.Item>
              
              <FlexboxGrid.Item>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '700',
                    color: '#059669',
                    marginBottom: '4px'
                  }}>
                    {Math.round(cahierData.reduce((acc, seance) => acc + seance.duree, 0) / 60)}h
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                    DURÉE TOTALE
                  </div>
                </div>
              </FlexboxGrid.Item>
              
              <FlexboxGrid.Item>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '700',
                    color: '#dc2626',
                    marginBottom: '4px'
                  }}>
                    {cahierData.filter(seance => seance.attachmentUrl).length}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                    FICHIERS JOINTS
                  </div>
                </div>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </div>

          {/* Liste des séances */}
          {cahierData.map((seance, index) => (
            <SeanceCard 
              key={seance.id} 
              seance={seance} 
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Mode embedded : retourner directement le contenu
  if (embedded) {
    return (
      <>
        {renderContent()}
        
        {/* Modal pour prévisualiser les images */}
        <Modal 
          open={imageModalOpen} 
          onClose={() => setImageModalOpen(false)}
          size="md"
        >
          <Modal.Header>
            <Modal.Title>Prévisualisation de l'image</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ textAlign: 'center', padding: '20px' }}>
            {selectedImage && (
              <img 
                src={selectedImage}
                alt="Prévisualisation"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '500px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              color="blue" 
              appearance="primary"
              startIcon={<FiDownload />}
              onClick={() => handleDownloadFile(selectedImage)}
            >
              Télécharger
            </Button>
            <Button onClick={() => setImageModalOpen(false)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Modal 
        open={isOpen} 
        onClose={onClose}
        size="lg"
        style={{ marginTop: '20px' }}
      >
        <Modal.Header style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '8px 8px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Modal.Title style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>
                Progression des Séances
              </Modal.Title>
              <div style={{ 
                fontSize: '14px', 
                opacity: '0.9',
                marginTop: '4px'
              }}>
                {selectedMatiere?.matiere?.libelle} - {selectedClasse?.libelle}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Whisper
                trigger="hover"
                speaker={<Tooltip>Actualiser les données</Tooltip>}
              >
                <IconButton
                  size="sm"
                  icon={<FiRefreshCw />}
                  onClick={() => {
                    refetch();
                    if (onRefresh) onRefresh();
                  }}
                  loading={loading}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none'
                  }}
                />
              </Whisper>
              <IconButton
                size="sm"
                icon={<FiX />}
                onClick={onClose}
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none'
                }}
              />
            </div>
          </div>
        </Modal.Header>
        
        <Modal.Body style={{ padding: 0 }}>
          {renderContent()}
        </Modal.Body>
      </Modal>

      {/* Modal pour prévisualiser les images */}
      <Modal 
        open={imageModalOpen} 
        onClose={() => setImageModalOpen(false)}
        size="md"
      >
        <Modal.Header>
          <Modal.Title>Prévisualisation de l'image</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center', padding: '20px' }}>
          {selectedImage && (
            <img 
              src={selectedImage}
              alt="Prévisualisation"
              style={{ 
                maxWidth: '100%',
                maxHeight: '500px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            color="blue" 
            appearance="primary"
            startIcon={<FiDownload />}
            onClick={() => handleDownloadFile(selectedImage)}
          >
            Télécharger
          </Button>
          <Button onClick={() => setImageModalOpen(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CahierDeTexteConsultation;