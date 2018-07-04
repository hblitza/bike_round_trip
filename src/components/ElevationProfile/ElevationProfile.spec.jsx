/*eslint-env jest*/
import '../../../spec/enzyme.conf';

import TestUtils from '../../../spec/TestUtils';
import ElevationProfile from './ElevationProfile.jsx';

describe('<ElevationProfile />', () => {
  let defaultProps = {};

  beforeEach(() => {
    defaultProps = {
      t: t => t,
      elevationData: [
        [0,0,0],
        [1,0,9],
        [1,1,19],
      ],
      lineLength: 2,
      width: 400,
      height: 400,
      onLineHighlight: jest.fn()
    };
  });

  it('is defined', () => {
    expect(ElevationProfile).not.toBe(undefined);
  });

  it('can be rendered', () => {
    const wrapper = TestUtils.mountComponent(ElevationProfile, defaultProps);
    expect(wrapper).not.toBe(undefined);
  });

});
