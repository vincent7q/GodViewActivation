export interface CosmicStageSpec {
  key: string;
  nameZh: string;
  nameEn: string;
  /** Owner-authored description, shown verbatim on the caption card. */
  description: string;
  duration: number;
}

// The zoom-out ladder, smallest to largest. Order and copy come from the
// product owner (TODO.md); durations are pacing, tune freely.
export const COSMIC_STAGES: CosmicStageSpec[] = [
  {
    key: 'solar-system',
    nameZh: '太陽系',
    nameEn: 'Solar System',
    description: '由太陽引力主導的星系系統，我們位在距離太陽約 1.5 億公里的「適居帶」內。',
    duration: 15,
  },
  {
    key: 'orion-arm',
    nameZh: '獵戶座旋臂',
    nameEn: 'Orion Arm',
    description: '太陽系位於銀河系邊緣的一條主要螺旋臂上。',
    duration: 10,
  },
  {
    key: 'milky-way',
    nameZh: '銀河系',
    nameEn: 'Milky Way',
    description: '包含數千億顆恆星的巨大棒旋星系，直徑約 10 萬光年。',
    duration: 10,
  },
  {
    key: 'local-group',
    nameZh: '本星系群',
    nameEn: 'Local Group',
    description: '包含銀河系、仙女座星系等約 50 個星系組成的星系家族。',
    duration: 10,
  },
  {
    key: 'virgo-supercluster',
    nameZh: '室女座超星系團',
    nameEn: 'Virgo Supercluster',
    description: '包含本星系群在內、由數萬個星系組成的龐大結構。',
    duration: 10,
  },
  {
    key: 'laniakea',
    nameZh: '拉尼亞凱亞超星系團',
    nameEn: 'Laniakea Supercluster',
    description: '直徑約 5.2 億光年的巨大超星系團，是我們目前認知的超星系大本營。',
    duration: 10,
  },
  {
    key: 'observable-universe',
    nameZh: '可觀測宇宙',
    nameEn: 'Observable Universe',
    description: '以地球為中心、人類目前光學儀器與觀測技術所能看到的範圍。',
    duration: 15,
  },
];

// Shown as the homecoming card when the journey returns.
export const EARTH_INFO: CosmicStageSpec = {
  key: 'earth',
  nameZh: '地球',
  nameEn: 'Earth',
  description: '太陽系中第三顆行星，也是我們目前唯一已知的家園。',
  duration: 0,
};

export const COSMIC_TOTAL_SECONDS = COSMIC_STAGES.reduce((acc, s) => acc + s.duration, 0);

const CROSSFADE_SECONDS = 3;
const SHRINK_END = 0.05;

export interface StageEnvelope {
  opacity: number;
  scale: number;
}

// The "Powers of Ten" illusion with a static camera: the active stage
// shrinks toward the view center while the next structure fades in around
// it. Stage i is visible in [start_i, end_i + CROSSFADE], overlapping the
// next stage's fade-in. The last stage holds at full size for the quote.
export function stageEnvelopes(elapsed: number): StageEnvelope[] {
  let start = 0;
  return COSMIC_STAGES.map((stage, i) => {
    const end = start + stage.duration;
    const isFirst = i === 0;
    const isLast = i === COSMIC_STAGES.length - 1;

    let opacity: number;
    if (elapsed < start) {
      opacity = 0;
    } else if (elapsed < start + CROSSFADE_SECONDS && !isFirst) {
      opacity = (elapsed - start) / CROSSFADE_SECONDS;
    } else if (elapsed <= end || isLast) {
      opacity = 1;
    } else if (elapsed < end + CROSSFADE_SECONDS) {
      opacity = 1 - (elapsed - end) / CROSSFADE_SECONDS;
    } else {
      opacity = 0;
    }

    let scale = 1;
    if (!isLast && elapsed > start) {
      const lifespan = stage.duration + CROSSFADE_SECONDS;
      const progress = Math.min((elapsed - start) / lifespan, 1);
      scale = Math.pow(SHRINK_END, progress);
    }

    start = end;
    return { opacity, scale };
  });
}
