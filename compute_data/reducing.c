#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//#define DEBUG 1

typedef struct death_s {
	int b[4]; // boys number of death per origin
	int g[4]; // girls number of death per origin
} death_t;

typedef struct state_s {
	death_t b[25]; // boys from 1990 to 2014
	death_t g[25]; // girls from 1990 to 2014
} state_t;

state_t states[51];
char statesNames[51][21] = {"Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhodes Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
    "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"};

void add_to_file(FILE * f_out)
{
	// for each date
	for(int d = 0; d <= 24; d++) {
		// for each state
		for(int i = 0; i < 51; i++) {
			// for each race
			for(int j = 0; j < 4; j++) {
				fputs(statesNames[i], f_out);
				fputc(',', f_out);
				char date[5];
				//printf("date: %d\n", d + 1990);
				sprintf(date, "%d", d + 1990);
				fputs(date, f_out);
				fputc(',', f_out);
				switch(j) {
					case 0: fputs("Black", f_out); break;
					case 1: fputs("White", f_out); break;
					case 2: fputs("Native American/Alaska Native", f_out); break;
					case 3: fputs("Asian/Pacific Islander", f_out); break;
				}
				fputc(',', f_out);
				char str_nb[9];
				sprintf(str_nb, "%d", states[i].b[d].b[j]);
				fputs(str_nb, f_out);
				fputc(',', f_out);
				sprintf(str_nb, "%d", states[i].g[d].g[j]);
				fputs(str_nb, f_out);
				fputc('\n', f_out);
			}
		}
	}
}

int main(int argc, char * argv[])
{
	if(argc != 3){
		printf("Usage: ./main input_file output_file\n");
		return 1;
	}
	FILE * f_in = fopen(argv[1], "r");
	FILE * f_out = fopen(argv[2], "w");
	if(f_in == NULL){
		printf("[ERROR] Input file does not exists\n");
		return 1;
	}
	if(f_out == NULL){
		printf("[ERROR] Ouput file cannot be created\n");
		return 1;
	}
	int line_size = 512;
	char * line = malloc(line_size);
    char current_state[21];
	// skip first line
	fgets(line, line_size, f_in);
    fputs("State,Date,Race,Men,Women\n", f_out);

	int count = 0;
	int state_idx = 0;

	while(fgets(line, line_size, f_in) != NULL)
	{
		// remove lines where '"' are used
		int idx_rm_specials = 0;
		while(line[idx_rm_specials++] != '\n')
			if(line[idx_rm_specials] == '"') {
				//printf("[STRANGE LINE] %s\n", line);
				goto continue_loop;
			}
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
		state_name[tmp_idx] = '\0';
#ifdef DEBUG
		printf("state_name: %s, ", state_name);
#endif
        // if the state changes, write all data into out file
        if(strcmp(current_state, state_name)) {
			// get country idx
			state_idx = 0;
			for(int j = 0; j < 51; j++)
				if(strcmp(state_name, statesNames[j]) == 0){
					state_idx = j;
					break;
				}
			strcpy(current_state, state_name);
        }
		// go to date
		i++;
		// get date
		int date = 0;
		int power = 1000;
		for(int j = 0; j < 4; j++) {
			date += (line[i++] - '0') * power;
			power /= 10;
		}
		date -= 1990;
		if(date < 0)
			continue;
        // go to victim sex
        comma_count = 0;
        while(comma_count != 5)
			if(line[i++] == ',')
				comma_count++;
        int sex = 0; // male
        // get victim sex
        if(line[i] == 'F')
            sex = 1;
#ifdef DEBUG
		printf("sex: %s(%c), ", sex ? "woman" : "man", line[i]);
#endif
        // go to victim race
        comma_count = 0;
        while(comma_count != 2)
			if(line[i++] == ',')
				comma_count++;
        // get victim race
        switch(line[i]) {
            case 'B': (sex) ? states[state_idx].g[date].g[0]++ : states[state_idx].b[date].b[0]++; break; // Black
            case 'W': (sex) ? states[state_idx].g[date].g[1]++ : states[state_idx].b[date].b[1]++; break; // White
            case 'N': (sex) ? states[state_idx].g[date].g[2]++ : states[state_idx].b[date].b[2]++; break; // Native
            case 'A': (sex) ? states[state_idx].g[date].g[3]++ : states[state_idx].b[date].b[3]++; break; // Asian
        }
#ifdef DEBUG
		printf("race: %c\n", line[i]);
#endif
		// add infos to data variable
continue_loop: count++;
	}
	add_to_file(f_out);
	fclose(f_in);
	fclose(f_out);
	return 0;
}
