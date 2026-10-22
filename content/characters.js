// 등장인물 생김새: 3D 인물과 대화창 얼굴 그림이 함께 쓴다.
// face: eyes(round·kind·stern), brows(normal·stern·worried), mouth(smile·flat·open), beard(null·mustache·goatee·full), beardColor, blush
// 모든 인물은 근엄한 표정(가는 눈, 힘준 눈썹, 다문 입)으로 그린다.
export const LOOKS = {
  player: { robe: 0x2f6b5e, hat: 'helmet', face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  soldier: { robe: 0x7a3b2e, hat: 'helmet', face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  archer: { robe: 0x5d6b3e, hat: 'helmet', face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  officer: { robe: 0x6a4c6e, hat: 'official', face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'mustache', beardColor: '#8d877c' } },
  seohui: { robe: 0x2b4c7e, hat: 'official', trim: 0xd9a441, face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'goatee' } },
  sonn: { robe: 0x5b4a36, hat: 'fur', trim: 0xb8452f, face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'mustache' } },
  yanggyu: { robe: 0x7a2a1e, hat: 'general', trim: 0xd9a441, face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'full' } },
  // 강감찬은 귀주 대첩 때 일흔이 넘은 나이여서 흰 수염으로 그린다
  gangamchan: { robe: 0x8a2f24, hat: 'general', trim: 0xd9a441, face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'full', beardColor: '#e8e4dc' } },
  villager: { robe: 0xd8cfbf, hat: 'topknot', face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  khitan: { robe: 0x6e5a44, hat: 'fur', face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  khitanBright: { robe: 0xa8834f, hat: 'fur', trim: 0xb8452f, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  // 2차시(4~6장)
  kimyunhu: { robe: 0x7d7a74, hat: 'bald', trim: 0x9a6b3c, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  monk: { robe: 0x8a8780, hat: 'bald', face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  minister: { robe: 0x55608a, hat: 'official', face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'goatee' } },
  artisan: { robe: 0xc8b89a, hat: 'topknot', trim: 0x6b4a32, face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'mustache' } },
  baejungson: { robe: 0x2a3a5a, hat: 'general', trim: 0xb8452f, face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'mustache' } },
  kimtongjeong: { robe: 0x4a3a2a, hat: 'general', trim: 0xd9a441, face: { eyes: 'stern', brows: 'stern', mouth: 'flat', beard: 'full' } },
  sambyeolcho: { robe: 0x3a2f2a, hat: 'helmet', trim: 0xb8452f, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  mongol: { robe: 0x3e4a5c, hat: 'fur', trim: 0xd9a441, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
};

export const look = (id, extra = {}) => ({ ...LOOKS[id], ...extra });
