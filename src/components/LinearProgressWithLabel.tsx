import { useTranslation } from 'react-i18next';

const LinearProgressWithLabel = ({ value }) => {

  const { t } = useTranslation();

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{t('EWP_PROGRESS')}</span>
        <span>{`${Math.round(value)}%`}</span>
      </div>
      <div
        style={{
          backgroundColor: '#b3b3b3',
          borderRadius: '4px',
          height: '10px',
          marginTop: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            backgroundColor: '#1976d2',
            height: '100%',
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};

export default LinearProgressWithLabel;
