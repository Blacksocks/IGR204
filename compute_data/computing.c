#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//#define   DEBUG           1
#define   NB_WEAPONS      15
#define   NB_RELATIONSHIP 26

typedef struct {
  // State name
  char name[21];
  // Number of crimes not solved
  int crime_not_solved;
  // Weapon used
  // Handgun, Knife, Rifle, Blunt Object, Firearm, Shotgun,
  // Strangulation, Suffocation, Fire, Gun, Explosives,
  // Drowning, Poison, Drugs, Fall
  // Relationship for each weapon used
  // Husband, Stranger, Acquaintance, Family, Wife, Son,
  // Girlfriend, Boyfriend, Stepmother, Friend, Common-Law Husband,
  // Boyfriend/Girlfriend, Daughter, Mother, Father, Stepson, In-Law,
  // Neighbor, Brother, Common-Law Wife, Ex-Wife, Employer, Ex-Husband,
  // Stepdaughter, Stepfather, Sister
  int relationship[431];
} state_t;

int main(int argc, char * argv[])
{
  if(argc != 3){
    printf("Usage: ./main input_file output_file_pattern\n");
    return 1;
  }
  FILE * f_in = fopen(argv[1], "r");
  if(f_in == NULL){
    printf("[ERROR] Input file does not exists\n");
    return 1;
  }
  int line_size = 1024;
  char * line = malloc(line_size);
  char * stateNames[] = {"Alabama", "Alaska", "Arizona", "Arkansas",
    "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
    "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana",
    "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota",
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhodes Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
    "Washington", "West Virginia", "Wisconsin",
    "Wyoming", "District of Columbia"};
  char * weapons[] = {"Handgun", "Knife", "Rifle", "Blunt Object",
    "Firearm", "Shotgun", "Strangulation", "Suffocation",
    "Fire", "Gun", "Explosives", "Drowning",
    "Poison", "Drugs", "Fall"};
  char * relationships[] = {"Husband", "Stranger", "Acquaintance",
    "Family", "Wife", "Son", "Girlfriend", "Boyfriend",
    "Stepmother", "Friend", "Common-Law Husband",
    "Boyfriend/Girlfriend", "Daughter", "Mother", "Father",
    "Stepson", "In-Law", "Neighbor", "Brother",
    "Common-Law Wife", "Ex-Wife", "Employer", "Ex-Husband",
    "Stepdaughter", "Stepfather", "Sister"};
  // init states
  state_t states[50];
  for(int i = 0; i < 50; i++)
  {
    strcpy(states[i].name, stateNames[i]);
    states[i].crime_not_solved = 0;
    for(int j = 0; j < 390; j++)
      states[i].relationship[j] = 0;
  }
  // skip first line
  fgets(line, line_size, f_in);

  while(fgets(line, line_size, f_in) != NULL)
  {
    int comma_count = 0;
    int i = 0;
    // go to state name position
    while(comma_count != 5)
      if(line[i++] == ',')
        comma_count++;
    // get state name
    char state_name[21];
    int tmp_idx = 0;
    while(line[i] != ',')
      state_name[tmp_idx++] = line[i++];
    i++;
    state_name[tmp_idx] = '\0';
    // replace District of Columbia per Columbia
    if(strcmp(state_name, stateNames[50]) == 0)
      strcpy(state_name, stateNames[46]);
#ifdef DEBUG
    printf("state_name: %s\n", state_name);
#endif
    // get state idx
    int idx = -1;
    for(; ++idx < 50;)
      if(strcmp(stateNames[idx], state_name) == 0)
        break;
#ifdef DEBUG
    printf("state_idx: %d\n", idx);
#endif
    // go to crime status position
    comma_count = 0;
    while(comma_count != 4)
      if(line[i++] == ',')
        comma_count++;
    // get crime status
    if(line[i] == 'N')
      states[idx].crime_not_solved++;
#ifdef DEBUG
    printf("crime_solved: %c\n", line[i]);
#endif
    // if crime is not solved, we can't know weapon or relationship
    if(line[i] == 'N')
      continue;
    // go to relationship position
    comma_count = 0;
    while(comma_count != 9)
      if(line[i++] == ',')
        comma_count++;
    // get relationship
    char relationship[21];
    tmp_idx = 0;
    while(line[i] != ',')
      relationship[tmp_idx++] = line[i++];
    i++;
    relationship[tmp_idx] = '\0';
    // merge 'Boyfriend' and 'Girlfriend' into 'Boyfriend/Girlfriend'
    if(!strcmp(relationship, "Boyfriend") || !strcmp(relationship, "Girlfriend"))
        strcpy(relationship, "Boyfriend/Girlfriend");
    // merge 'Common-Law Husband' into 'Husband'
    if(!strcmp(relationship, "Common-Law Husband"))
        strcpy(relationship, "Husband");
    // merge 'Common-Law Wife' into 'Wife'
    if(!strcmp(relationship, "Common-Law Wife"))
        strcpy(relationship, "Wife");
#ifdef DEBUG
    printf("relationship: >%s<\n", relationship);
#endif
    // get relationship id
    int relationship_id = -1;
    for(; ++relationship_id < NB_RELATIONSHIP;)
      if(strcmp(relationships[relationship_id], relationship) == 0)
        break;
    // get weapon
    char weapon[NB_WEAPONS - 1];
    tmp_idx = 0;
    while(line[i] != ',')
      weapon[tmp_idx++] = line[i++];
    weapon[tmp_idx] = '\0';
    // merge 'Handgun', 'Rifle', 'Shotgun' and 'Gun' into 'Firearm'
    if(!strcmp(weapon, "Handgun") || !strcmp(weapon, "Rifle") || !strcmp(weapon, "Shotgun") || !strcmp(weapon, "Gun"))
        strcpy(weapon, "Firearm");
#ifdef DEBUG
    printf("weapon: %s\n", weapon);
#endif
    // get weapon id
    int weapon_id = -1;
    for(; ++weapon_id < NB_WEAPONS;)
      if(strcmp(weapons[weapon_id], weapon) == 0)
        break;
    if(weapon_id == NB_WEAPONS)
      relationship_id = 0;
    // set relationship and weapon
    states[idx].relationship[weapon_id * (NB_RELATIONSHIP + 1) + relationship_id]++;
  }
  fclose(f_in);

  // Save data
  FILE * f_out;
  int len_path = strlen(argv[2]);
  char file_out_name[len_path + 26];
  for(int i = 0; i < len_path; i++)
    file_out_name[i] = argv[2][i];
  file_out_name[len_path] = '_';
  // remove '-' into relationship status
  char relationships_print[NB_RELATIONSHIP][21];
  for(int rs = 0; rs < NB_RELATIONSHIP; rs++) {
    unsigned int i = 0;
    for(; i < strlen(relationships[rs]); i++) {
      relationships_print[rs][i] = relationships[rs][i];
      if(relationships[rs][i] == '-')
        relationships_print[rs][i] = ' ';
    }
    relationships_print[rs][i] = '\0';
  }
  for(int i = 0; i < 50; i++)
  {
    // get output filename as /path/to/folder/prefix_statename.csv
    int idx = 0;
    for(; states[i].name[idx] != '\0'; idx++)
      file_out_name[len_path + 1 + idx] = states[i].name[idx];
    idx += len_path + 1;
    file_out_name[idx++] = '.';
    file_out_name[idx++] = 'c';
    file_out_name[idx++] = 's';
    file_out_name[idx++] = 'v';
    file_out_name[idx++] = '\0';
#ifdef DEBUG
    printf("%s\n", file_out_name);
#endif
    f_out = fopen(file_out_name, "w");
    fputs("no,", f_out);
    char crime_not_solved[12];
    sprintf(crime_not_solved, "%d", states[i].crime_not_solved);
    fputs(crime_not_solved, f_out);
    fputc('\n', f_out);
    for(int wp = 0; wp < NB_WEAPONS; wp++) {
      for(int rs = 0; rs < NB_RELATIONSHIP; rs++) {
        if(states[i].relationship[wp * (NB_RELATIONSHIP + 1) + rs] == 0)
            continue;
        fputs("yes-", f_out);
        fputs(weapons[wp], f_out);
        fputc('-', f_out);
        // rename Boyfriend/Girlfriend into Boy/Girlfriend
        if(!strcmp(relationships_print[rs], "Boyfriend/Girlfriend"))
            fputs("Boy/Girlfriend", f_out);
        else
            fputs(relationships_print[rs], f_out);
        fputc(',', f_out);
        char relationship[12];
        sprintf(relationship, "%d", states[i].relationship[wp * (NB_RELATIONSHIP + 1) + rs]);
        fputs(relationship, f_out);
        fputc('\n', f_out);
      }
      fputs("yes-", f_out);
      fputs(weapons[wp], f_out);
      fputs("-end,", f_out);
      char weapon_unknown[12];
      sprintf(weapon_unknown, "%d", states[i].relationship[wp * (NB_RELATIONSHIP + 1) + NB_RELATIONSHIP]);
      fputs(weapon_unknown, f_out);
      fputc('\n', f_out);
    }
    fputs("yes-end,", f_out);
    char yes_unknown[12];
    sprintf(yes_unknown, "%d", states[i].relationship[NB_WEAPONS * (NB_RELATIONSHIP + 1)]);
    fputs(yes_unknown, f_out);
    fputc('\n', f_out);
    fclose(f_out);
  }
  return 0;
}
