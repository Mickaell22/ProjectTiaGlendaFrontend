// src/routes/Loadable.js
import { Suspense } from 'react';
import Spinner from 'src/components/shared/Spinner';

const Loadable = (Component) => (props) =>
  (
    <Suspense fallback={<Spinner />}>
      <Component {...props} />
    </Suspense>
  );

export default Loadable;