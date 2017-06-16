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

int main()
{
  FILE *fptr;
  FILE *wr;
  char buff[32];
  char previous_buff[32];

  if ((fptr = fopen("../data/us_pop.txt","r")) == NULL){
       printf("Error! opening file\n");

       // Program exits if the file pointer returns NULL.
       exit(1);
   }

   if ((wr = fopen("../data/us_pop_merge_on_age.txt", "w")) == NULL) {
     printf("Error! opening file");

     exit(1);
   }

   int population = 0;
   int previous_age = -1;
   int number[8];
   int iter = 0;
   while (fscanf(fptr, "%s", buff) != EOF)
   {
     int age = (buff[16] - '0') * 10 + (buff[17] - '0') ;
     if (age - previous_age <= 0)
     {
       int numberDigit = getNumberDigit(population);
       iter = 0;
       for (int i = 0 ; i < 8 ; i++)
       {
         if (i < 8 - numberDigit) number[i] = 0;
         else
         {
           number[7-iter] = population % 10 ;
           population = population / 10;
           iter++;
         }
       }


       //Write into file.
       fprintf(wr, "%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%d%d%d%d%d%d%d%d\n", previous_buff[0], previous_buff[1], previous_buff[2], previous_buff[3],
        previous_buff[4], previous_buff[5], previous_buff[6], previous_buff[7], previous_buff[8], previous_buff[9],
        previous_buff[10], previous_buff[11], previous_buff[12], previous_buff[13], previous_buff[14],
        previous_buff[15], number[0], number[1], number[2], number[3], number[4], number[5], number[6], number[7]);
     }
     population += (buff[25] - '0') + (buff[24] - '0') * 10 + (buff[23] - '0') * 100 + (buff[22] - '0') * 1000 +
                    (buff[21] - '0') * 10000 + (buff[20] - '0') * 100000 + (buff[19] - '0') * 1000000 +
                    (buff[18] - '0') * 10000000;
     previous_age = age;
     for (int i = 0 ; i < 32 ; i++) previous_buff[i] = buff[i];
   }

   fclose(fptr);
   fclose(wr);
}
