#include <stdio.h>
#include <stdlib.h>
#include <math.h>

typedef int bool;
#define true 1
#define false 0

int getNumberDigit(int number)
{
  int res = -1;
  int loop = 1;
  while (res != 0)
  {
    res = number / pow(10, loop);
    loop++;
  }
  return loop -1;
}

void writeToFile(FILE *f, int race, int sex, int population, char buff[32], int n0, int n1)
{
  int number[9];
  int numberDigit = getNumberDigit(population);
  int iter = 0;
  for (int i = 0 ; i < 9 ; i++)
  {
    if (i < 9 - numberDigit) number[i] = 0;
    else
    {
      number[8-iter] = population % 10 ;
      population = population / 10;
      iter++;
    }
  }

  fprintf(f, "%c%c%c%c,%c%c,%d%d,%d,%d,%d%d%d%d%d%d%d%d%d\n", buff[0], buff[1], buff[2], buff[3], buff[4], buff[5], n1, n0,
                            race, sex, number[0], number[1], number[2], number[3], number[4], number[5], number[6], number[7], number[8]);
}

int main()
{
  FILE *fptr;
  FILE *wr;
  char buff[32];
  char previous_buff[32];

  if ((fptr = fopen("../data/us_pop_merge_on_age_and_origin.txt","r")) == NULL){
       printf("Error! opening file");

       // Program exits if the file pointer returns NULL.
       exit(1);
   }

   if ((wr = fopen("../data/data_us_pop.csv", "w")) == NULL) {
     printf("Error! opening file");

     exit(1);
   }

   //Writing to file the schema of the organization: Year, State, State Nb, Race, Sex, Population
   fprintf(wr, "Year,State,State Nb,Race,Sex,Population\n");

   int previous_state = 1000;
   int current_state = 0;
   int pop_11 = 0, pop_12 = 0, pop_21 = 0, pop_22 = 0, pop_31 = 0, pop_32 = 0, pop_41 = 0, pop_42 = 0;
   int loop = 1;

   while (fscanf(fptr, "%s", buff) != EOF)
   {
     int n0 = (buff[7] - '0');
     int n1 = 10*(buff[6] - '0');
     current_state = n0 + n1 ;
     if (current_state == 1) loop = 1;
     int race = buff[11] - '0';
     int sex = buff[12] - '0';
     if (current_state - previous_state > 0)  //Another state.
     {
       writeToFile(wr, 1, 1, pop_11, previous_buff, loop%10, loop/10);
       writeToFile(wr, 1, 2, pop_12, previous_buff, loop%10, loop/10);
       writeToFile(wr, 2, 1, pop_21, previous_buff, loop%10, loop/10);
       writeToFile(wr, 2, 2, pop_22, previous_buff, loop%10, loop/10);
       writeToFile(wr, 3, 1, pop_31, previous_buff, loop%10, loop/10);
       writeToFile(wr, 3, 2, pop_32, previous_buff, loop%10, loop/10);
       writeToFile(wr, 4, 1, pop_41, previous_buff, loop%10, loop/10);
       writeToFile(wr, 4, 2, pop_42, previous_buff, loop%10, loop/10);
       pop_11 = 0, pop_12 = 0, pop_21 = 0, pop_22 = 0, pop_31 = 0, pop_32 = 0, pop_41 = 0, pop_42 = 0;
       loop++;
     }
     if (buff[0] == '2' && buff[1] == '0' && buff[2] == '1' && buff[3] == '5')
      break;
     int population = 0;
     for (int i = 0 ; i < 8 ; i++) population += (buff[20-i] - '0') * pow(10,i);

      if (race == 1 && sex == 1) pop_11 += population;
      if (race == 1 && sex == 2) pop_12 += population;
      if (race == 2 && sex == 1) pop_21 += population;
      if (race == 2 && sex == 2) pop_22 += population;
      if (race == 3 && sex == 1) pop_31 += population;
      if (race == 3 && sex == 2) pop_32 += population;
      if (race == 4 && sex == 1) pop_41 += population;
      if (race == 4 && sex == 2) pop_42 += population;

     previous_state = current_state;
     for (int i = 0 ; i < 32 ; i++) previous_buff[i] = buff[i];

   }

   fclose(fptr);
   fclose(wr);
}
