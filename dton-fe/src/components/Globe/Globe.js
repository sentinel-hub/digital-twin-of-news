import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import EventTypes from './EventTypes';
import Popup from './Popup';

import { EVENT_TYPE, SWIPE_POPUP_STATUSES } from '../../const';

import globeVideo from '../../assets/globe.mp4';
import './globe.scss';
import styleVars from '../../variables.scss';
import SwipePopup from './SwipePopup';
import Header from '../Header/Header';

import SentinelhubLogo from '../../assets/sentinelhub-logo.svg';
import ESALogo from '../../assets/esa-logo.svg';

const GLOBE_RADIUS = 100;

const COLORS = {
  [EVENT_TYPE.WILDFIRE]: new THREE.Color(styleVars.wildfireColor),
  [EVENT_TYPE.ICEBERG]: new THREE.Color(styleVars.icebergColor),
  [EVENT_TYPE.FLOOD]: new THREE.Color(styleVars.floodColor),
  [EVENT_TYPE.VOLCANO]: new THREE.Color(styleVars.volcanoColor),
  [EVENT_TYPE.DROUGHT]: new THREE.Color(styleVars.droughtColor),
  [EVENT_TYPE.AIR_POLLUTION]: new THREE.Color(styleVars.airPollutionColor),
};

const HALO_SIZE = 0.07;
const INITIAL_CAMERA_DISTANCE = 250;
const DEFAULT_DAMPING_FACTOR = 0.05;
const DEFAULT_ROTATE_SPEED = 0.3;

const getPositionFromCoordinates = ([_lon, _lat]) => {
  const phi = (90 - _lat) * (Math.PI / 180);
  const theta = (_lon + 180) * (Math.PI / 180);

  const x = -(GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta));
  const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
  const y = GLOBE_RADIUS * Math.cos(phi);

  return [x, y, z];
};

const VERTEX_SHADER = `
  varying vec3 vNormal;
  void main()
  {
      vNormal = normalize( normalMatrix * normal );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
  `;

const FRAGMENT_SHADER = `
  uniform float c;
  uniform float p;
  uniform vec3 glowColor;
  varying vec3 vNormal;
  void main()
  {
    float intensity = pow( c - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), p );
    gl_FragColor = vec4( glowColor, 1.0 ) * intensity;
  }
`;

class Globe extends Component {
  globeContainer = React.createRef();
  eventPoints = new THREE.Object3D();
  raycaster = new THREE.Raycaster();
  mouseVector = new THREE.Vector3();
  scene = new THREE.Scene();
  dummyObject = new THREE.Object3D();
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  eventPointsScale = 1;
  requestAnimationFrameHandle = null;
  prevScale = 1;

  state = {
    popup: null,
    filterPopupStatus: SWIPE_POPUP_STATUSES.init,
  };

  componentDidMount() {
    const { clientWidth, clientHeight } = this.globeContainer.current;

    this.renderer.setSize(clientWidth, clientHeight);
    document.body.appendChild(this.renderer.domElement);
    // this.renderer.setClearColor(0x367b98, 0.2);
    // use ref as a mount point of the Three.js scene instead of the document.body
    this.globeContainer.current.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(50, clientWidth / clientHeight, 1, 1000);
    this.camera.position.set(0, 0, INITIAL_CAMERA_DISTANCE);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 130;
    this.controls.maxDistance = 400;
    this.controls.rotateSpeed = 0.3;
    this.controls.autoRotateSpeed = 0.2;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = DEFAULT_DAMPING_FACTOR;
    this.controls.autoRotate = true;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = DEFAULT_ROTATE_SPEED;

    this.addLights();
    this.createGlobe();
    this.addLandPoints();
    this.addHalo();
    this.renderThree();

    this.addEventListeners();
  }

  componentWillUnmount() {
    this.removeEventListeners();
    if (this.requestAnimationFrameHandle) {
      cancelAnimationFrame(this.requestAnimationFrameHandle);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filteredEvents !== this.props.filteredEvents) {
      this.addLandPoints();
    }
  }

  getZoomScale = () => {
    const distance = this.controls.target.distanceTo(this.controls.object.position);
    const scale = (distance / INITIAL_CAMERA_DISTANCE) ** 2;
    return { scale, distance };
  };

  renderThree = () => {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    this.requestAnimationFrameHandle = requestAnimationFrame(this.renderThree);
  };

  updateHaloSize = () => {
    const scaleHalo = 1 + HALO_SIZE / Math.pow(this.camera.position.length() / INITIAL_CAMERA_DISTANCE, 2);
    this.halo.scale.set(scaleHalo, scaleHalo, scaleHalo);
  };

  addEventListeners = () => {
    window.addEventListener('resize', this.windowResizeHandler, false);
    this.globeContainer.current.addEventListener('click', this.displayPopup);
    this.globeContainer.current.addEventListener('touchend', this.displayPopup);
    // stop autorotate after the first interaction
    this.controls.addEventListener('start', this.stopAutoRotate);
    // restart autorotate after the last interaction & an idle time has passed
    this.controls.addEventListener('end', this.delayedStartAutoRotate);
    this.controls.addEventListener('change', this.updateGlobeAfterChange);
  };

  removeEventListeners = () => {
    window.removeEventListener('resize', this.windowResizeHandler, false);
    this.globeContainer.current.removeEventListener('click', this.displayPopup);
    this.globeContainer.current.removeEventListener('touchend', this.displayPopup);
    this.controls.removeEventListener('start', this.stopAutoRotate);
    this.controls.removeEventListener('end', this.delayedStartAutoRotate);
    this.controls.removeEventListener('change', this.updateGlobeAfterChange);
  };

  stopAutoRotate = () => {
    clearTimeout(this.autorotateTimeout);
    this.controls.autoRotate = false;
  };

  delayedStartAutoRotate = () => {
    clearTimeout(this.autorotateTimeout);
    this.autorotateTimeout = setTimeout(() => {
      if (this.state.popup) {
        return;
      }
      this.controls.autoRotate = true;
    }, 5000);
  };

  updateGlobeAfterChange = () => {
    const { scale, distance } = this.getZoomScale();
    if (scale !== this.eventPointsScale) {
      if (scale < 1) {
        this.controls.dampingFactor = DEFAULT_DAMPING_FACTOR * (distance / INITIAL_CAMERA_DISTANCE);
        this.controls.rotateSpeed = DEFAULT_ROTATE_SPEED * scale;
      }
    }
    this.scaleLandPoints(scale);
    if (this.halo) {
      this.updateHaloSize();
    }
  };

  scaleLandPoints = (scale) => {
    if (!this.eventsMesh) {
      return;
    }

    const _scaleVector = new THREE.Vector3();
    const scaleFactor = scale / this.prevScale;
    for (let i in this.props.filteredEvents) {
      _scaleVector.set(scaleFactor, scaleFactor, scaleFactor);
      this.eventsMesh.getMatrixAt(i, this.dummyObject.matrix);
      this.touchSensitiveMesh.getMatrixAt(i, this.dummyObject.matrix);
      this.dummyObject.matrix.scale(_scaleVector);
      this.eventsMesh.setMatrixAt(i, this.dummyObject.matrix);
      this.touchSensitiveMesh.setMatrixAt(i, this.dummyObject.matrix);
    }
    this.eventsMesh.instanceMatrix.needsUpdate = true;
    this.prevScale = scale;
  };

  addLights = () => {
    this.scene.add(new THREE.AmbientLight(0xb0aeae));

    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(89, 30, 50);
    this.scene.add(light);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.6);
    light2.position.set(-80, -30, 50);
    this.scene.add(light2);
  };

  createGlobe = () => {
    /*
      Video needs to be properly prepared before it can be included here. We start by reading original video information:

        $ mediainfo globe_lr.mp4
        Duration                                 : 3s 0ms
        Frame rate                               : 12.333 FPS

      In order to get a smooth play on low speed we need more frames per second. As we also want a smoother transition between frames we interpolate the original video and add more frames by duplicating existing ones.
      
      1. Interpolation: This command changes 12.333 fps to 24.666 fps (== 12.333 * 2) by interpolating 1 frame in between of each couple of subsequent frames:
        $ ffmpeg  -i globe_lr.mp4 -framerate 12.333 -vf minterpolate=fps=24.666:mi_mode=mci globe_interpolated2.mp4
 
        2. Duplication: This command changes 24.666 fps to 197.328 fps (=== 24.666 *8) by duplicating the previous or next frame 7 times. This is done in order to have a high enough frame rate for a smooth play even with low speed.
        $ ffmpeg  -i globe_interpolated2.mp4 -framerate 24.666 -vf minterpolate=fps=197.328:mi_mode=blend globe_interpolated2_blend8.mp4
      
      Then we convert to a very low framerate, so that the play time is around 3 minutes. Starting with 3s original time, this
      means that we need to divide frame rate with ~60. The new frame rate is thus 197.328 / 60 = 3.2888 
      At the same time we get rid of audio, if it was present.

        $ ffmpeg -y -i globe_interpolated2_blend8.mp4 -c copy -f h264 globe_noaudio_int2_blend8.h264
        $ ffmpeg -y -r 3.2888 -i globe_noaudio_int2_blend8.h264 -c copy globe.mp4
    */
    const video = document.createElement('video');
    video.style.display = 'none';
    video.src = globeVideo;
    video.loop = true;
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.playbackRate = 1;
    video.play();
    // firefox issue regarding low fps and video texture
    // https://github.com/mozilla/hubs/pull/4210
    const texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBAFormat;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 128, 128);
    this.globe = new THREE.Mesh(geometry, material);
    this.scene.add(this.globe);
  };

  addHalo = () => {
    let uniforms = {
      c: { type: 'f', value: 0.92 },
      p: { type: 'f', value: 4.41 },
      glowColor: { type: 'c', value: new THREE.Color(0x3561ac) },
      viewVector: { type: 'v3', value: this.camera.position },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: FRAGMENT_SHADER,
      vertexShader: VERTEX_SHADER,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 128, 128);
    this.halo = new THREE.Mesh(geometry, material);
    this.updateHaloSize();
    this.scene.add(this.halo);
  };

  addLandPoints = () => {
    this.eventPoints.clear();
    this.prevScale = 1;
    const circleRadius = 1.5;
    const touchSensitiveCircleRadius = 3 * circleRadius;
    const strokeWidth = 0.3;

    const filledCircle = new THREE.CircleBufferGeometry(circleRadius, 32);
    const touchSensitiveCircle = new THREE.CircleBufferGeometry(touchSensitiveCircleRadius);

    const lookDirection = new THREE.Vector3();
    const positionVector = new THREE.Vector3();

    const { filteredEvents } = this.props;

    let uniforms = {
      strokeColor: { type: 'vec3', value: new THREE.Color(0xffffff) },
      radius: { type: 'float', value: circleRadius },
    };

    const material = new THREE.MeshBasicMaterial({
      depthTest: false,
    });

    const touchSensitiveMaterial = new THREE.MeshBasicMaterial({ alphaTest: 1, opacity: 0 });

    material.onBeforeCompile = function (shader) {
      shader.extensionDerivatives = true;
      shader.uniforms.strokeColor = uniforms.strokeColor;
      shader.uniforms.radius = uniforms.radius;
      shader.vertexShader = `
      attribute vec3 fillColor;
      attribute float strokeWidth;
      varying vec3 vUv; 
      varying vec3 vPos;
      varying vec3 vFillColor;
      varying float aStrokeWidth;
      ${shader.vertexShader}
    `.replace(
        `#include <fog_vertex>`,
        `#include <fog_vertex>
      vPos = vec3(transformed);
      vUv = position; 
      vFillColor = vec3(fillColor);
      aStrokeWidth = strokeWidth;
    `,
      );
      shader.fragmentShader = `
      uniform vec3 strokeColor; 
      varying vec3 vFillColor;
      varying float aStrokeWidth;
      varying vec3 vUv;
      uniform float radius;
      
     ${shader.fragmentShader}
    `.replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        ` 
  float outerEdgeCenter =  radius - aStrokeWidth;
  float distance = sqrt(vUv.x*vUv.x + vUv.y*vUv.y);
  float delta = fwidth(distance);
  float stroke = 1.0 - smoothstep(outerEdgeCenter - delta, outerEdgeCenter + delta, distance);
  vec3 col = mix(strokeColor,vFillColor, stroke);
  vec4 diffuseColor = vec4( col, opacity );
`,
      );
    };

    let index = 0;
    let fillColor = [];
    let strokesWidths = [];

    if (filteredEvents !== null) {
      this.eventsMesh = new THREE.InstancedMesh(filledCircle, material, filteredEvents.length);
      this.touchSensitiveMesh = new THREE.InstancedMesh(
        touchSensitiveCircle,
        touchSensitiveMaterial,
        filteredEvents.length,
      );
      this.touchSensitiveMesh.isTouchSensitiveLayer = true;
      for (let event of filteredEvents) {
        const coords = getPositionFromCoordinates([event.lng, event.lat]);
        this.dummyObject.position.set(coords[0], coords[1], coords[2]);

        positionVector.set(coords[0], coords[1], coords[2]);
        lookDirection.subVectors(positionVector, this.globe.position).normalize();

        this.dummyObject.updateMatrix();
        this.dummyObject.matrix.lookAt(positionVector, this.globe.position, lookDirection);
        this.eventsMesh.setMatrixAt(index, this.dummyObject.matrix);
        this.touchSensitiveMesh.setMatrixAt(index, this.dummyObject.matrix);
        fillColor.push(COLORS[event.type].r, COLORS[event.type].g, COLORS[event.type].b);
        strokesWidths.push(event.overrideConfirmed ? strokeWidth : 0.0);

        index++;
      }
      filledCircle.setAttribute(
        'fillColor',
        new THREE.InstancedBufferAttribute(new Float32Array(fillColor), 3),
      );
      filledCircle.setAttribute(
        'strokeWidth',
        new THREE.InstancedBufferAttribute(new Float32Array(strokesWidths), 1),
      );

      this.eventsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.touchSensitiveMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.eventPoints.add(this.eventsMesh);
      this.eventPoints.add(this.touchSensitiveMesh);
    }
    const { scale } = this.getZoomScale();
    this.scaleLandPoints(scale);
    this.scene.add(this.eventPoints);
  };

  displayPopup = (event) => {
    const { clientWidth, clientHeight } = this.globeContainer.current;
    const { x, y } = this.getCanvasRelativePosition(event);
    this.mouseVector.x = (x / clientWidth) * 2 - 1;
    this.mouseVector.y = -(y / clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseVector, this.camera);

    const isTouchEvent = event.type === 'touchend';

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.eventPoints.children);

    if (intersects.length > 0) {
      const intersectedIds = [];
      const intersectedEvents = [];
      for (let intersected of intersects) {
        if (intersected.object.isTouchSensitiveLayer && !isTouchEvent) {
          continue;
        }
        if (!intersectedIds.includes(intersected.instanceId)) {
          intersectedEvents.push(this.props.filteredEvents[intersected.instanceId]);
          intersectedIds.push(intersected.instanceId);
        }
      }
      if (intersectedEvents.length > 0) {
        intersectedEvents.sort((a, b) => b.date - a.date);
        this.setState({ popup: intersectedEvents });
      }
    }
  };

  closePopup = () => {
    this.setState({ popup: null });
  };

  getCanvasRelativePosition = (event) => {
    const { clientWidth, clientHeight } = this.globeContainer.current;
    const rect = this.globeContainer.current.getBoundingClientRect();
    if (event.type === 'click') {
      return {
        x: ((event.clientX - rect.left) * clientWidth) / rect.width,
        y: ((event.clientY - rect.top) * clientHeight) / rect.height,
      };
    }
    if (event.type === 'touchend') {
      return {
        x: ((event.changedTouches[0].clientX - rect.left) * clientWidth) / rect.width,
        y: ((event.changedTouches[0].clientY - rect.top) * clientHeight) / rect.height,
      };
    }
  };

  windowResizeHandler = () => {
    const { clientWidth, clientHeight } = this.globeContainer.current;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
    if (clientWidth < 500) {
      this.camera.position.set(0, 0, 400);
    }
    if (clientWidth < 800) {
      this.camera.position.set(0, 0, 350);
    }
  };

  getLogoClassNames = () => {
    const { filterPopupStatus } = this.state;
    const medium = parseInt(styleVars.medium.replace('px', ''));
    const { windowSize } = this.props;

    if (windowSize.width > medium) {
      return '';
    }

    if (filterPopupStatus === SWIPE_POPUP_STATUSES.open) {
      return `logo-faded`;
    }

    return '';
  };
  render() {
    const {
      windowSize,
      onShowDocumentationMenuClick,
      showingGlobe,
      setShowingGlobe,
      calendarHolder,
    } = this.props;
    const medium = parseInt(styleVars.medium.replace('px', ''));
    return (
      <>
        {this.state.popup && <Popup events={this.state.popup} closePopup={this.closePopup}></Popup>}
        <div className="globe" ref={this.globeContainer}>
          <Header
            onInformationButtonClick={onShowDocumentationMenuClick}
            showingGlobe={showingGlobe}
            setShowingGlobe={setShowingGlobe}
            calendarHolder={calendarHolder}
          />
          {windowSize.width > medium ? (
            <EventTypes />
          ) : (
            <SwipePopup
              setSwipePopupStatus={(newStatus) => this.setState({ filterPopupStatus: newStatus })}
              swipePopupStatus={this.state.filterPopupStatus}
            >
              <EventTypes />
            </SwipePopup>
          )}
          <div className="logos">
            <div className="logo">
              <img className={`esa-logo ${this.getLogoClassNames()}`} src={ESALogo} alt="" />
            </div>
            <div className="logo">
              <img className={`sh-logo ${this.getLogoClassNames()}`} src={SentinelhubLogo} alt="" />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Globe;
