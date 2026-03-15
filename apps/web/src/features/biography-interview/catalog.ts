import { CatalogQuestionSchema, type CatalogQuestion } from './contracts';

export const BIOGRAPHY_INTERVIEW_CATALOG_VERSION = '2026-03-14-v1';

const RAW_CATALOG = [
  ['basis.birth', 'basis_information', 'Basisinformationen', 'Wann und wo wurden Sie geboren?', 'date'],
  ['basis.home', 'basis_information', 'Basisinformationen', 'Wo leben Sie derzeit, und fühlt es sich für Sie dort nach Zuhause an?', 'place'],
  ['basis.relationship_status', 'basis_information', 'Basisinformationen', 'Was ist dein Beziehungsstatus?', 'single_choice'],
  ['basis.sexual_orientation', 'basis_information', 'Basisinformationen', 'Wie definierst du deine sexuelle Orientierung?', 'single_choice'],
  ['basis.religion_identity', 'basis_information', 'Basisinformationen', 'Identifizierst du dich mit einer Religion?', 'single_choice'],
  ['basis.religion_type', 'basis_information', 'Basisinformationen', 'Wenn ja: Welche Religion beschreibt dich am besten?', 'single_choice', { dependsOn: [{ questionId: 'basis.religion_identity', anyKeywords: ['ja', 'yes'] }] }],
  ['basis.christian_denomination', 'basis_information', 'Basisinformationen', 'Wenn du dich als Christ:in identifizierst: Welche Konfession beschreibt dich am besten?', 'single_choice', { dependsOn: [{ questionId: 'basis.religion_type', anyKeywords: ['christ', 'christentum', 'evangelisch', 'katholisch', 'orthodox'] }] }],
  ['basis.religion_importance', 'basis_information', 'Basisinformationen', 'Wie wichtig ist Religion in deinem Leben?', 'single_choice', { dependsOn: [{ questionId: 'basis.religion_identity', anyKeywords: ['ja', 'yes'] }] }],
  ['basis.belief_duration', 'basis_information', 'Basisinformationen', 'Wie lange ist dein Glaube schon wichtig für dich?', 'single_choice', { dependsOn: [{ questionId: 'basis.religion_importance', noneKeywords: ['überhaupt nicht', 'gar nicht', 'not important'] }] }],
  ['basis.spirituality', 'basis_information', 'Basisinformationen', 'Betrachtest du dich als spirituell?', 'single_choice'],
  ['basis.preservation_attempts', 'basis_information', 'Basisinformationen', 'Hast du früher schon einmal versucht, Aspekte deines Lebens oder Alltags für die Nachwelt festzuhalten?', 'single_choice'],

  ['family.describe', 'family_background', 'Familienhintergrund', 'Wie würdest du deine Familie beschreiben?', 'free_text'],
  ['family.siblings', 'family_background', 'Familienhintergrund', 'Hast du Geschwister? Wenn ja, wie heißen sie, wann wurden sie geboren und wie war oder ist euer Verhältnis?', 'free_text'],
  ['family.parents_role', 'family_background', 'Familienhintergrund', 'Welche Rolle spielten deine Eltern oder Erziehungsberechtigten in deiner Kindheit?', 'free_text'],
  ['family.parents_names', 'family_background', 'Familienhintergrund', 'Wie heißen deine Eltern und wann wurden sie geboren?', 'free_text'],
  ['family.values', 'family_background', 'Familienhintergrund', 'Gibt es bestimmte Familienwerte oder Traditionen, die dich geprägt haben?', 'free_text'],
  ['family.influence', 'family_background', 'Familienhintergrund', 'Gibt es ein Familienmitglied, das dich besonders inspiriert oder beeinflusst hat?', 'free_text'],
  ['family.grandparents', 'family_background', 'Familienhintergrund', 'Wie heißen deine Großeltern, wann wurden sie geboren und welche Erinnerungen verbindest du mit ihnen?', 'free_text'],

  ['childhood.earliest_memory', 'childhood_and_youth', 'Kindheit und Jugend', 'Was sind deine frühesten Kindheitserinnerungen?', 'free_text'],
  ['childhood.everyday_life', 'childhood_and_youth', 'Kindheit und Jugend', 'Wie war dein Alltag als Kind in Bezug auf Spiel, Schule und Freundschaften?', 'free_text'],
  ['childhood.turning_point', 'childhood_and_youth', 'Kindheit und Jugend', 'Gab es ein besonderes Ereignis in deiner Jugend, das dich nachhaltig geprägt hat?', 'free_text'],
  ['childhood.ambitions', 'childhood_and_youth', 'Kindheit und Jugend', 'Welche Träume oder Ambitionen hattest du als Teenager?', 'free_text'],
  ['childhood.environment', 'childhood_and_youth', 'Kindheit und Jugend', 'Wie sah dein Umfeld in dieser Lebensphase aus: Wohnort, Schule und Freunde?', 'free_text'],

  ['career.education', 'education_and_career', 'Ausbildung und Beruf', 'Welche Schule, Ausbildung oder welches Studium hast du besucht?', 'free_text'],
  ['career.mentors', 'education_and_career', 'Ausbildung und Beruf', 'Gab es Lehrer oder Mentoren, die einen bleibenden Eindruck hinterlassen haben?', 'free_text'],
  ['career.path_decision', 'education_and_career', 'Ausbildung und Beruf', 'Wann wusstest du, welchen beruflichen Weg du einschlagen möchtest?', 'free_text'],
  ['career.timeline', 'education_and_career', 'Ausbildung und Beruf', 'Wie verlief dein beruflicher Weg bisher mit Höhepunkten, Rückschlägen und Wendepunkten?', 'free_text'],
  ['career.proud_projects', 'education_and_career', 'Ausbildung und Beruf', 'Gibt es Projekte oder Leistungen, auf die du besonders stolz bist?', 'free_text'],
  ['career.motivation', 'education_and_career', 'Ausbildung und Beruf', 'Was treibt dich im Berufsleben an?', 'free_text'],

  ['relationships.key_people', 'relationships_and_social_environment', 'Beziehungen und soziales Umfeld', 'Wer waren oder sind die wichtigsten Menschen in deinem Leben?', 'free_text'],
  ['relationships.special_bonds', 'relationships_and_social_environment', 'Beziehungen und soziales Umfeld', 'Gibt es besondere Freundschaften, Partnerschaften oder Begegnungen, die dich geprägt haben?', 'free_text'],
  ['relationships.conflict_loss_closeness', 'relationships_and_social_environment', 'Beziehungen und soziales Umfeld', 'Wie gehst du mit Konflikten, Verlust oder Nähe um?', 'free_text', { sensitive: true }],
  ['relationships.social_values', 'relationships_and_social_environment', 'Beziehungen und soziales Umfeld', 'Welche gesellschaftlichen oder sozialen Werte sind dir wichtig?', 'free_text'],

  ['values.self_description', 'personal_development_and_values', 'Persönliche Entwicklung und Werte', 'Wie würdest du dich in drei Worten beschreiben?', 'free_text'],
  ['values.strengths', 'personal_development_and_values', 'Persönliche Entwicklung und Werte', 'Welche persönlichen Stärken zeichnen dich aus?', 'free_text'],
  ['values.biggest_challenge', 'personal_development_and_values', 'Persönliche Entwicklung und Werte', 'Was war bisher deine größte Herausforderung und wie hast du sie gemeistert?', 'free_text'],
  ['values.guiding_values', 'personal_development_and_values', 'Persönliche Entwicklung und Werte', 'Welche Werte oder Überzeugungen leiten deine Entscheidungen?', 'free_text'],
  ['values.change', 'personal_development_and_values', 'Persönliche Entwicklung und Werte', 'Wie gehst du mit Veränderungen oder Neuanfängen um?', 'free_text'],

  ['interests.hobbies', 'interests_and_passions', 'Interessen und Leidenschaften', 'Welche Hobbys oder Leidenschaften begleiten dich durchs Leben?', 'free_text'],
  ['interests.deep_topic', 'interests_and_passions', 'Interessen und Leidenschaften', 'Gibt es ein Thema, über das du stundenlang reden könntest?', 'free_text'],
  ['interests.culture', 'interests_and_passions', 'Interessen und Leidenschaften', 'Welche Kultur, etwa Musik, Kunst, Sport oder Reisen, spielt in deinem Leben eine Rolle?', 'free_text'],
  ['interests.energy', 'interests_and_passions', 'Interessen und Leidenschaften', 'Welche Orte oder Aktivitäten geben dir Energie oder Inspiration?', 'free_text'],

  ['future.motivation', 'life_philosophy_and_future', 'Lebensphilosophie und Zukunft', 'Was motiviert dich, morgens aufzustehen?', 'free_text'],
  ['future.success', 'life_philosophy_and_future', 'Lebensphilosophie und Zukunft', 'Wie definierst du Erfolg und Zufriedenheit für dich persönlich?', 'free_text'],
  ['future.goals', 'life_philosophy_and_future', 'Lebensphilosophie und Zukunft', 'Gibt es etwas, das du unbedingt noch erreichen oder erleben möchtest?', 'free_text'],
  ['future.impact', 'life_philosophy_and_future', 'Lebensphilosophie und Zukunft', 'Was möchtest du mit deiner Lebensgeschichte bei anderen bewirken?', 'free_text'],
  ['future.legacy', 'life_philosophy_and_future', 'Lebensphilosophie und Zukunft', 'Wie stellst du dir deinen Lebensabend oder dein Vermächtnis vor?', 'free_text'],

  ['narrative.genre', 'emotional_and_narrative_dimension', 'Emotionale und narrative Dimension', 'Wenn du dein Leben als Buchgenre beschreiben müsstest: welches wäre es?', 'free_text', { sensitive: true }],
  ['narrative.core_chapters', 'emotional_and_narrative_dimension', 'Emotionale und narrative Dimension', 'Welche drei Kapitel dürften in deiner Lebensgeschichte auf keinen Fall fehlen?', 'free_text', { sensitive: true }],
  ['narrative.quote', 'emotional_and_narrative_dimension', 'Emotionale und narrative Dimension', 'Gibt es ein Zitat oder Motto, das dein Leben gut beschreibt?', 'free_text', { sensitive: true }],
  ['narrative.cast', 'emotional_and_narrative_dimension', 'Emotionale und narrative Dimension', 'Wenn dein Leben verfilmt würde: wer sollte dich spielen?', 'free_text', { sensitive: true }],

  ['motivation.goal', 'autobiography_motivation', 'Autobiografie-Motivation', 'Was ist dein Hauptziel mit deiner Autobiografie?', 'free_text'],
  ['motivation.help', 'autobiography_motivation', 'Autobiografie-Motivation', 'Möchtest du zwischendurch Tipps und Schreibhilfen erhalten?', 'single_choice'],

  ['voice.feel', 'basis_profile_and_storytelling_voice', 'Profil und Erzählstimme', 'Wie soll sich deine Geschichte hauptsächlich anfühlen?', 'multi_choice'],
  ['voice.perspective', 'basis_profile_and_storytelling_voice', 'Profil und Erzählstimme', 'Welche Erzählperspektive bevorzugst du?', 'single_choice'],
] as const;

type RawQuestion = (typeof RAW_CATALOG)[number];

function normalizeQuestion(entry: RawQuestion): CatalogQuestion {
  const [id, topicId, topicLabel, promptIntent, answerType, options] = entry;
  const sensitive = options && 'sensitive' in options ? options.sensitive : false;
  const dependsOn = options && 'dependsOn' in options ? options.dependsOn : [];

  return CatalogQuestionSchema.parse({
    id,
    topicId,
    topicLabel,
    order: RAW_CATALOG.findIndex((candidate) => candidate[0] === id),
    promptIntent,
    required: true,
    sensitive,
    answerType,
    dependsOn,
    skipOnDecline: true,
  });
}

export const biographyInterviewCatalog = RAW_CATALOG.map(normalizeQuestion);

export function getCatalogQuestion(questionId: string): CatalogQuestion | null {
  return biographyInterviewCatalog.find((question) => question.id === questionId) ?? null;
}

export function getCatalogQuestionsByTopic(topicId: string): CatalogQuestion[] {
  return biographyInterviewCatalog.filter((question) => question.topicId === topicId);
}
