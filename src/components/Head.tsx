import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '../config';

type HeadProps = {
  title?: string;
  description?: string;
};

export const Head = ({ title = '', description = '' }: HeadProps = {}) => {
  return (
    <Helmet
      title={title ? `${title} - ${APP_NAME}` : undefined}
      defaultTitle="App Default Title"
    >
      <meta name="description" content={description} />
    </Helmet>
  );
};