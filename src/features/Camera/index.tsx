/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Animated } from 'react-animated-css';
import Button from 'common/Button';
// import useVideo from 'hooks/useVideo';
import { loadScripts, showVideo } from 'utils';
import { dependencies, filterButtons } from './data';
import './index.scss';

type Filter = 'dog' | 'bees' | 'halloween' | 'deform';

interface Props {
  drawers: any;
}

declare global {
  interface Window {
    JEEFACEFILTERAPI: any;
    Filters: any;
  }
}

const Camera: React.FC<Props> = ({ drawers }) => {
  const videoPlayer = useRef<any>();

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filter, setFilter] = useState<Filter | null>(null);
  const [filterReady, setFilterReady] = useState<boolean>(false);
  const [loadedFilters, setLoadedFilters] = useState<Filter[]>([]);

  const [videoStream, setVideoStream] = useState<any>();

  useEffect(() => {
    startVideo();
  }, []);

  // Start/stop video when drawer is opened and closed
  useEffect(() => {
    // const atleastOneDrawerOpen = drawers.some(({ show }) => show);
    // if (atleastOneDrawerOpen) stopVideo();
    // else startVideo();
    // startVideo();
  }, [drawers]);

  const showFilter = () => setFilterReady(true);

  useEffect(() => {
    if (!filter) return;
    if (loadedFilters.includes(filter)) {
      window.Filters[filter].init(showFilter);
    } else {
      loadScripts(dependencies[filter], () => {
        window.Filters[filter].init(showFilter);
        setLoadedFilters([...loadedFilters, filter]);
      });
    }
  }, [filter]);

  const switchFilter = async (filter: Filter) => {
    if (loadedFilters.length) {
      try {
        await window.JEEFACEFILTERAPI.destroy();
        setFilter(filter);
      } catch (err) {}
    } else {
      // stopVideo();
      setFilter(filter);
    }
  };

  const startVideo = () => {
    showVideo((stream) => {
      videoPlayer.current.srcObject = stream;
      setVideoStream(stream);
    });
  };

  const stopVideo = () => videoStream.getTracks()[0].stop();

  return (
    <main className="camera">
      {!filterReady && (
        <video ref={videoPlayer} autoPlay className="video-stream"></video>
      )}

      <section className="controls">
        {/* Tmp */}
        {showFilters && (
          <Button
            icon="faTimesCircle"
            iconClass="close"
            onclick={() => {
              window.JEEFACEFILTERAPI.destroy();
              setShowFilters(false);
              setFilter(null);
              startVideo();
            }}
          />
        )}

        <Button icon="faCircle" buttonClass="btn-capture" />

        {!showFilters && (
          <Button
            icon="faLaugh"
            buttonClass="btn-filters"
            onclick={() => setShowFilters(true)}
          />
        )}

        <Animated
          animationIn="slideInRight"
          animationOut="fadeOut"
          animationInDuration={100}
          animationOutDuration={0}
          isVisible={showFilters}
          animateOnMount={false}
        >
          <div className="filters">
            {filterButtons.map(({ icon, filter }, index) => (
              <Button
                key={filter + index}
                icon={icon}
                onclick={() => switchFilter(filter as Filter)}
              />
            ))}
          </div>
        </Animated>
      </section>
    </main>
  );
};

const mapStateToProps = ({ app }) => ({ drawers: app.drawers });

export default connect(mapStateToProps, null)(Camera);
