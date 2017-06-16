#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//#define DEBUG 1

void add_to_file(char * current_state, int * boys, int * girls, FILE * f_out)
{
	// for each race
	for(int j = 0; j < 4; j++) {
		// for two sex
		for(int k = 0; k < 2; k++) {
			fputs(current_state, f_out);
			fputc(',', f_out);
			fputs(k ? "Female" : "Male", f_out);
			fputc(',', f_out);
			switch(j) {
				case 0: fputs("Black", f_out); break;
				case 1: fputs("White", f_out); break;
				case 2: fputs("Native American/Alaska Native", f_out); break;
				case 3: fputs("Asian/Pacific Islander", f_out); break;
			}
			fputc(',', f_out);
			char str_nb[9];
			sprintf(str_nb, "%d", k ? boys[j] : girls[j]);
			fputs(str_nb, f_out);
			fputc('\n', f_out);
		}
	}
}

int main(int argc, char * argv[])
{
	if(argc != 4){
		printf("Usage: ./main input_file output_file ratio\n");
		return 1;
	}
	FILE * f_in = fopen(argv[1], "r");
	FILE * f_out = fopen(argv[2], "w");
	float ratio = strtof(argv[3], NULL);
	if(ratio <= 0 || ratio >= 1) {
		printf("ratio should be between O and 1 (exclusive)\n");
		return 1;
	}
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
    int girls[] = {0, 0, 0, 0};
    int boys[] = {0, 0, 0, 0};
	// skip first line
	fgets(line, line_size, f_in);
    fputs("State,Victim Sex,Victim Race,Number Death\n", f_out);

	int count = 0;

	while(fgets(line, line_size, f_in) != NULL)
	{
		// remove lines where '"' are used
		int idx_rm_specials = 0;
		while(line[idx_rm_specials++] != '\n')
			if(line[idx_rm_specials] == '"')
				goto continue_loop;
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
		char tmp[21] = "Worcester";
		if(strcmp(state_name, tmp) == 0)
			printf("%s\n", line);
#ifdef DEBUG
		printf("state_name: %s, ", state_name);
#endif
        // if the state changes, write all data into out file
        if(strcmp(current_state, state_name)) {
			if(count != 0)
				add_to_file(current_state, boys, girls, f_out);
			girls[0] = 0;
			girls[1] = 0;
			girls[2] = 0;
			girls[3] = 0;
			boys[0] = 0;
			boys[1] = 0;
			boys[2] = 0;
			boys[3] = 0;
			strcpy(current_state, state_name);
        }
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
            case 'B': (sex) ? girls[0]++ : boys[0]++; break; // Black
            case 'W': (sex) ? girls[1]++ : boys[1]++; break; // White
            case 'N': (sex) ? girls[2]++ : boys[2]++; break; // Native
            case 'A': (sex) ? girls[3]++ : boys[3]++; break; // Asian
        }
#ifdef DEBUG
		printf("race: %c\n", line[i]);
#endif
continue_loop: count++;
	}
	add_to_file(current_state, boys, girls, f_out);
	fclose(f_in);
	fclose(f_out);
	return 0;
}
